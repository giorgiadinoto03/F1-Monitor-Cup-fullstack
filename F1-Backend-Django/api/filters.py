import django_filters
from .models import Result, Race, Session


class ResultFilter(django_filters.FilterSet):
    """
    Filtro personalizzato per i risultati con etichette user-friendly
    """
    # Filtro per meeting_key con etichetta personalizzata
    weekend = django_filters.NumberFilter(
        field_name='session__race__meeting_key',
        label='Weekend (Meeting Key)',
        help_text='Filtra per il codice del weekend'
    )
    
    # Filtro per session_key con etichetta personalizzata
    session = django_filters.NumberFilter(
        field_name='session__session_key',
        label='Sessione (Session Key)',
        help_text='Filtra per il codice della sessione'
    )
    
    # Filtro per numero pilota
    driver_number = django_filters.NumberFilter(
        field_name='driver__number',
        label='Numero Pilota',
        help_text='Filtra per il numero del pilota'
    )
    
    # Filtro per posizione (solo esatta, rimuoviamo lte e gte)
    position = django_filters.NumberFilter(
        field_name='position',
        label='Posizione',
        help_text='Filtra per la posizione esatta'
    )

    class Meta:
        model = Result
        fields = ['weekend', 'session', 'driver_number', 'position']


class RaceFilter(django_filters.FilterSet):
    """
    Filtro personalizzato per le gare con etichette user-friendly
    """
    weekend = django_filters.NumberFilter(
        field_name='meeting_key',
        label='Weekend (Meeting Key)',
        help_text='Filtra per il codice del weekend'
    )
    
    country = django_filters.CharFilter(
        field_name='country_name',
        label='Paese',
        help_text='Filtra per il nome del paese'
    )
    
    location = django_filters.CharFilter(
        field_name='location',
        label='Località',
        help_text='Filtra per la località del circuito'
    )

    class Meta:
        model = Race
        fields = ['weekend', 'country', 'location']


class SessionFilter(django_filters.FilterSet):
    """
    Filtro personalizzato per le sessioni con etichette user-friendly
    """
    weekend = django_filters.NumberFilter(
        field_name='race__meeting_key',
        label='Weekend (Meeting Key)',
        help_text='Filtra per il codice del weekend'
    )
    
    session_type = django_filters.CharFilter(
        field_name='session_type',
        label='Tipo Sessione',
        help_text='Filtra per il tipo di sessione (Race, Qualifying, etc.)'
    )

    class Meta:
        model = Session
        fields = ['weekend', 'session_type']
