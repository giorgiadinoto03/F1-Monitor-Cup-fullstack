from django.contrib import admin
from .models import Team, Driver, Race, Session, Result
from django.utils.html import format_html


# Inline per vedere i piloti direttamente dentro il Team
class DriverInline(admin.TabularInline):
    model = Driver
    extra = 0

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('team_name', 'team_colour', 'points')
    search_fields = ('team_name',)
    list_filter = ('team_colour',)
    ordering = ('-points', 'team_name')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('number', 'full_name', 'acronym', 'team', 'country_name', 'points')
    search_fields = ('full_name', 'acronym', 'number')
    list_filter = ('team', 'country_name')
    ordering = ('team__team_name', 'number')
    autocomplete_fields = ('team',)

@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ('meeting_key', 'meeting_name', 'country_name', 'location', 'year', 'thumbnail')
    search_fields = ('meeting_name', 'country_name', 'location', 'meeting_key')
    list_filter = ('country_name', 'location', 'year')
    ordering = ('-year', 'meeting_name')

    def thumbnail(self, obj):
        if obj.circuit_image_url:
            return format_html('<img src="{}" style="height:30px;border-radius:4px;" />', obj.circuit_image_url)
        return '-'
    thumbnail.short_description = 'Circuito'
    
class ResultInline(admin.TabularInline):
    model = Result
    extra = 0
    fields = ('driver', 'position', 'duration', 'gap_to_leader')
    readonly_fields = ()
    autocomplete_fields = ('driver',)
    ordering = ('position',)

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'session_name', 'session_type', 'race', 'date_start')
    search_fields = ('session_name', 'session_key', 'race__meeting_name', 'race__meeting_key')
    list_filter = ('session_type', 'race__meeting_key')
    ordering = ('-date_start',)
    inlines = (ResultInline,)

@admin.action(description="Ricalcola classifica della sessione selezionata")
def recompute_selected_sessions(modeladmin, request, queryset):
    # Esempio: ricalcola per le sessioni coinvolte (se implementi una funzione utility)
    from api.models import Session
    from django.db.models import Value
    session_ids = queryset.values_list('session_id', flat=True).distinct()
    # Qui potresti chiamare la tua utility recompute_session_results(session_id) se l'hai creata
    # for sid in session_ids: recompute_session_results(sid)
    modeladmin.message_user(request, f"Richiesto ricalcolo per {len(set(session_ids))} sessioni.")

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('meeting_key', 'session_key', 'driver', 'team_name', 'position', 'duration', 'gap_to_leader')
    search_fields = ('driver__full_name', 'driver__number', 'session__session_key', 'session__race__meeting_key')
    list_filter = ('session__race__meeting_key', 'session__session_key', 'session__session_type', 'position')
    ordering = ('session__race__meeting_key', 'session__session_key', 'position')
    autocomplete_fields = ('driver', 'session')
    actions = (recompute_selected_sessions,)

    def meeting_key(self, obj):
        return obj.session.race.meeting_key

    def session_key(self, obj):
        return obj.session.session_key

    def team_name(self, obj):
        return obj.driver.team.team_name if obj.driver and obj.driver.team else '-'