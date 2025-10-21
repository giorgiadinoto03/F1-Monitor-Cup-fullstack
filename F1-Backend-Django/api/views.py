from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Min
from .models import *
from .serializers import *
from .filters import ResultFilter, RaceFilter, SessionFilter
from django_filters.rest_framework import DjangoFilterBackend
from .pagination import DefaultPagination # Import your pagination class


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['team_name']
    ordering_fields = ['team_name', 'points']
    pagination_class = DefaultPagination # Apply pagination


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.select_related('team').all()
    serializer_class = DriverSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'team__team_name': ['exact'],
        'country_code': ['exact'],
        'number': ['exact'],
    }
    search_fields = ['full_name', 'acronym', 'team__team_name']
    ordering_fields = ['full_name', 'points', 'number']
    pagination_class = DefaultPagination # Apply pagination

class RaceViewSet(viewsets.ModelViewSet):
    queryset = Race.objects.annotate(date_start=Min('sessions__date_start')).order_by('date_start')
    serializer_class = RaceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RaceFilter
    search_fields = ['meeting_name', 'location', 'country_name']
    ordering_fields = ['date_start', 'meeting_name', 'location']
    pagination_class = DefaultPagination

    # 🔥 QUESTA FUNZIONE DEVE STARE DENTRO LA CLASSE RaceViewSet
    @action(detail=False, methods=['get'], url_path='next')
    def next_race(self, request):
        today = now().date()
        race = (
            self.get_queryset()
            .filter(date_start__gte=today)
            .order_by('date_start')
            .first()
        )
        
        # 🔥 FALLBACK: Se non trova gare future, cerca nei JSON
        if not race:
            import json
            import os
            from django.utils.dateparse import parse_datetime
            from datetime import datetime
            
            try:
                # Carica dal tuo JSON gp2025.json
                file_path = os.path.join('data', 'gp2025.json')
                with open(file_path, 'r', encoding='utf-8') as file:
                    gp_data = json.load(file)
                
                # Trova la prossima gara (prima gara con data futura)
                next_gp = None
                current_date = datetime.now().date()
                
                for gp in gp_data:
                    date_str = gp.get('date_start')
                    if date_str:
                        # Converti la stringa data in datetime
                        gp_date = parse_datetime(date_str)
                        if gp_date and gp_date.date() >= current_date:
                            if not next_gp or gp_date < parse_datetime(next_gp['date_start']):
                                next_gp = gp
                
                if next_gp:
                    # Fix per l'URL dell'immagine
                    image_url = next_gp.get('circuit_image', '')
                    if image_url and image_url.startswith('../public/'):
                        image_url = image_url.replace('../public/', '')
                    
                    return Response({
                        "meeting_key": next_gp.get("meeting_key"),
                        "meeting_name": next_gp.get("meeting_name"),
                        "meeting_official_name": next_gp.get("meeting_official_name"),
                        "location": next_gp.get("location"), 
                        "country_name": next_gp.get("country_name"),
                        "date_start": next_gp.get("date_start"),
                        "date_end": next_gp.get("date_start"),  # Per semplicità
                        "image_url": image_url,
                        "year": 2025,
                        "circuit_key": next_gp.get("circuit_key")
                    })
                    
            except Exception as e:
                print(f"Errore fallback JSON: {e}")
                # Se c'è errore, prova a restituire almeno una gara dai JSON
                try:
                    if gp_data:
                        first_gp = gp_data[0]
                        image_url = first_gp.get('circuit_image', '').replace('../public/', '')
                        return Response({
                            "meeting_key": first_gp.get("meeting_key"),
                            "meeting_name": first_gp.get("meeting_name"),
                            "meeting_official_name": first_gp.get("meeting_official_name"),
                            "location": first_gp.get("location"), 
                            "country_name": first_gp.get("country_name"),
                            "date_start": first_gp.get("date_start"),
                            "date_end": first_gp.get("date_start"),
                            "image_url": image_url,
                            "year": 2025,
                            "circuit_key": first_gp.get("circuit_key")
                        })
                except:
                    pass
        
        if not race:
            return Response({'detail': 'Non ci sono gare in programma'}, status=404)
        
        serializer = self.get_serializer(race)
        return Response(serializer.data)

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related('race').all()
    serializer_class = SessionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SessionFilter
    ordering_fields = ['date_start', 'session_name']
    pagination_class = DefaultPagination # Apply pagination


class ResultViewSet(viewsets.ModelViewSet):
    # Inizializza il queryset di base con tutti i dati necessari
    queryset = Result.objects.select_related('session', 'session__race', 'driver', 'driver__team').all()
    serializer_class = ResultSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    pagination_class = DefaultPagination # Apply pagination
    filterset_class = ResultFilter
    # Ordinamento personalizzato: prima i classificati per posizione, poi i non classificati
    
    def get_queryset(self):

        # Ordinamento di default (senza filtri):
        # - Prima per meeting_key (weekend)
        # - Poi per session_key (evento)
        # - Dentro la sessione: classificati per posizione
        # - Non classificati (position=NULL) in fondo, ordinati per duration

        queryset = super().get_queryset()

        # Se non è richiesto un ordering esplicito via query param, applica il nostro
        if not self.request.query_params.get('ordering'):
            from django.db.models import Case, When, IntegerField

            queryset = queryset.annotate(
                # 0 = classificati (position non null), 1 = non classificati (position null)
                sort_priority=Case(
                    When(position__isnull=True, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by(
                'session__race__meeting_key',
                'session__session_key',
                'sort_priority',      # classificati prima (0), non classificati dopo (1)
                'position',           # tra i classificati, ordina per posizione 1,2,3...
                'duration'            # tra i non classificati, ordina per duration
            )

        return queryset

    def get_serializer_class(self):
        if self.action == 'list' or self.action in ['qualify', 'race']: # Applica anche alle custom actions
            return ResultListSerializer
        return ResultSerializer

    @action(detail=False, methods=['get'], url_path='qualify')
    def qualify(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(session__session_type__iexact='Qualifying')
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='race')
    def race(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(session__session_type__iexact='Race')
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)