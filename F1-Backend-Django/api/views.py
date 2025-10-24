# api/views.py - CORREZIONE COMPLETA
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from django.db.models import Q
from .models import *
from .serializers import *
from .filters import ResultFilter, RaceFilter, SessionFilter
from django_filters.rest_framework import DjangoFilterBackend
from .pagination import DefaultPagination

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['team_name']
    ordering_fields = ['team_name', 'points']
    pagination_class = DefaultPagination
    
    def list(self, request, *args, **kwargs):
        # Override per gestire correttamente i filtri
        queryset = self.filter_queryset(self.get_queryset())
        
        team_name = request.query_params.get('team_name')
        if team_name:
            queryset = queryset.filter(team_name__icontains=team_name)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.select_related('team').all()
    serializer_class = DriverSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'team__team_name': ['exact', 'icontains'],
        'country_code': ['exact'],
        'number': ['exact'],
    }
    search_fields = ['full_name', 'acronym', 'team__team_name']
    ordering_fields = ['full_name', 'points', 'number']
    pagination_class = DefaultPagination
    
    def list(self, request, *args, **kwargs):
        # Override per gestire correttamente i filtri
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtro team per nome
        team_name = request.query_params.get('team__team_name')
        if team_name:
            queryset = queryset.filter(team__team_name__icontains=team_name)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RaceViewSet(viewsets.ModelViewSet):
    queryset = Race.objects.all().order_by('date_start')
    serializer_class = RaceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RaceFilter
    search_fields = ['meeting_name', 'location', 'country_name']
    ordering_fields = ['date_start', 'meeting_name', 'location']
    pagination_class = DefaultPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro per anno
        year = self.request.query_params.get('year')
        if year:
            try:
                year_int = int(year)
                queryset = queryset.filter(year=year_int)
            except (ValueError, TypeError):
                # Se l'anno non è valido, ritorna tutto
                pass
                
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='next')
    def next_race(self, request):
        today = now().date()
        
        try:
            # Prima cerca nel database
            race = (
                self.get_queryset()
                .filter(date_start__gte=today)
                .order_by('date_start')
                .first()
            )
            
            if race:
                serializer = NextRaceSerializer(race, context={'request': request})
                return Response(serializer.data)
            
            # Fallback ai dati JSON
            import json
            import os
            from django.utils.dateparse import parse_datetime
            from datetime import datetime
            
            try:
                file_path = os.path.join('data', 'gp2025.json')
                with open(file_path, 'r', encoding='utf-8') as file:
                    gp_data = json.load(file)
                
                next_gp = None
                current_date = datetime.now().date()
                
                for gp in gp_data:
                    date_str = gp.get('date_start')
                    if date_str:
                        gp_date = parse_datetime(date_str)
                        if gp_date and gp_date.date() >= current_date:
                            if not next_gp or gp_date < parse_datetime(next_gp['date_start']):
                                next_gp = gp
                
                if next_gp:
                    circuit_image = next_gp.get('circuit_image', '')
                    if circuit_image and circuit_image.startswith('../media/'):
                        circuit_image = circuit_image.replace('../media/', '/media/')
                    
                    return Response({
                        "meeting_key": next_gp.get("meeting_key"),
                        "meeting_name": next_gp.get("meeting_name"),
                        "meeting_official_name": next_gp.get("meeting_official_name"),
                        "location": next_gp.get("location"), 
                        "country_name": next_gp.get("country_name"),
                        "date_start": next_gp.get("date_start"),
                        "date_end": next_gp.get("date_start"),
                        "circuit_image": circuit_image,
                        "year": 2025,
                        "circuit_key": next_gp.get("circuit_key")
                    })
                    
            except Exception as e:
                print(f"Errore fallback JSON: {e}")
                if gp_data:
                    first_gp = gp_data[0]
                    circuit_image = first_gp.get('circuit_image', '').replace('../media/', '/media/')
                    return Response({
                        "meeting_key": first_gp.get("meeting_key"),
                        "meeting_name": first_gp.get("meeting_name"),
                        "meeting_official_name": first_gp.get("meeting_official_name"),
                        "location": first_gp.get("location"), 
                        "country_name": first_gp.get("country_name"),
                        "date_start": first_gp.get("date_start"),
                        "date_end": first_gp.get("date_start"),
                        "circuit_image": circuit_image,
                        "year": 2025,
                        "circuit_key": first_gp.get("circuit_key")
                    })
        
        except Exception as e:
            return Response({'detail': f'Errore interno del server: {str(e)}'}, status=500)
        
        return Response({'detail': 'Non ci sono gare in programma'}, status=404)

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.select_related('race').all()
    serializer_class = SessionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SessionFilter
    ordering_fields = ['date_start', 'session_name']
    pagination_class = DefaultPagination
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtro per weekend (meeting_key)
        weekend = request.query_params.get('weekend')
        if weekend:
            queryset = queryset.filter(race__meeting_key=weekend)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related('session', 'session__race', 'driver', 'driver__team').all()
    serializer_class = ResultSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    pagination_class = DefaultPagination
    filterset_class = ResultFilter

    def get_queryset(self):
        queryset = super().get_queryset()

        if not self.request.query_params.get('ordering'):
            from django.db.models import Case, When, IntegerField

            queryset = queryset.annotate(
                sort_priority=Case(
                    When(position__isnull=True, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by(
                'position',
                'session__race__meeting_key',
                'session__session_key',
                'sort_priority',
                'position',
                'duration'
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtri aggiuntivi
        weekend = request.query_params.get('weekend')
        session = request.query_params.get('session')
        
        if weekend:
            queryset = queryset.filter(session__race__meeting_key=weekend)
        if session:
            queryset = queryset.filter(session__session_key=session)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'list' or self.action in ['qualify', 'race']:
            return ResultListSerializer
        return ResultSerializer

    @action(detail=False, methods=['get'], url_path='qualify')
    def qualify(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(
            Q(session__session_type__iexact='Qualifying') | 
            Q(session__session_type__iexact='SPRINT_QUALIFYING')
        )
        
        weekend = request.query_params.get('weekend')
        if weekend:
            queryset = queryset.filter(session__race__meeting_key=weekend)
        
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='race')
    def race(self, request):
        queryset = self.filter_queryset(self.get_queryset()).filter(
            Q(session__session_type__iexact='Race') | 
            Q(session__session_type__iexact='SPRINT_RACE')
        )
        
        weekend = request.query_params.get('weekend')
        if weekend:
            queryset = queryset.filter(session__race__meeting_key=weekend)
        
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)