from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
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
    queryset = Race.objects.all()
    serializer_class = RaceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RaceFilter
    search_fields = ['meeting_name', 'location', 'country_name']
    ordering_fields = ['meeting_name', 'location']
    pagination_class = DefaultPagination # Apply pagination


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