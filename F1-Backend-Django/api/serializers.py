from django.db.models import Min, Max
from rest_framework import serializers
from .models import Team, Driver, Race, Session, Result

class TeamSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    livrea = serializers.CharField(source='team_colour', read_only=True)

    class Meta:
        model = Team
        fields = "__all__"

    def get_logo_url(self, obj):
        value = getattr(obj, "logo_url", None) or getattr(obj, "logo", None)
        if not value:
            return None
        # Se è un ImageField locale
        if hasattr(value, "url"):
            request = self.context.get("request")
            url = value.url
            return request.build_absolute_uri(url) if request else url
        # Altrimenti è una stringa o URL esterno
        return value

class DriverSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.team_name", read_only=True)
    team_colour = serializers.CharField(source="team.team_colour", read_only=True)
    headshot_url = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = "__all__"

    def get_headshot_url(self, obj):
        # 1) URL esterno (dai JSON originari)
        external = getattr(obj, "image_url", None) or getattr(obj, "headshot_url", None)
        if external:
            return external
        # 2) ImageField locale
        image_field = getattr(obj, "image", None) or getattr(obj, "headshot", None)
        if image_field and hasattr(image_field, "url"):
            request = self.context.get("request")
            url = image_field.url
            return request.build_absolute_uri(url) if request else url
        return None

# api/serializers.py - modifica RaceSerializer
# api/serializers.py - RaceSerializer aggiornato
class RaceSerializer(serializers.ModelSerializer):
    circuit_image_url = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    meeting_official_name = serializers.SerializerMethodField()
    
    def get_circuit_image_url(self, obj):
        if obj.circuit_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/media/{obj.circuit_image}')
            return f'/media/{obj.circuit_image}'
        return None
    
    def get_start_date(self, obj):
        first_session = obj.sessions.order_by('date_start').first()
        return first_session.date_start if first_session else None
    
    def get_meeting_official_name(self, obj):
        # Puoi personalizzare questo se necessario
        return f"FORMULA 1 {obj.meeting_name.upper()} {obj.year}"
    
    class Meta:
        model = Race
        fields = [
            'meeting_key', 'meeting_name', 'meeting_official_name',
            'location', 'country_name', 'year', 'circuit_key',
            'circuit_image_url', 'start_date'
        ]

class SessionSerializer(serializers.ModelSerializer):
    meeting_key = serializers.IntegerField(source="race.meeting_key", read_only=True)
    meeting_name = serializers.CharField(source="race.meeting_name", read_only=True)

    class Meta:
        model = Session
        fields = [
            "session_key",
            "session_name",
            "session_type",
            "date_start",
            "meeting_key",
            "meeting_name",
            "circuit_short_name",
        ]

class ResultSerializer(serializers.ModelSerializer):
    driver_number = serializers.IntegerField(source="driver.number", read_only=True)
    name_acronym = serializers.CharField(source="driver.acronym", read_only=True)
    full_name = serializers.CharField(source="driver.full_name", read_only=True)
    team_name = serializers.CharField(source="driver.team.team_name", read_only=True)
    team_colour = serializers.CharField(source="driver.team.team_colour", read_only=True)
    headshot_url = serializers.CharField(source="driver.image_url", read_only=True)
    meeting_key = serializers.IntegerField(source="session.race.meeting_key", read_only=True)
    session_key = serializers.IntegerField(source="session.session_key", read_only=True)

    class Meta:
        model = Result
        fields = [
            "session",
            "driver_number",
            "name_acronym",
            "full_name",
            "team_name",
            "team_colour",
            "headshot_url",
            "position",
            "duration",
            "gap_to_leader",
            "q1",
            "q2",
            "q3",
            "meeting_key",
            "session_key",
        ]

class ResultListSerializer(serializers.ModelSerializer):
    driver_number = serializers.IntegerField(source="driver.number", read_only=True)
    full_name = serializers.CharField(source="driver.full_name", read_only=True)
    team_name = serializers.CharField(source="driver.team.team_name", read_only=True)
    team_colour = serializers.CharField(source="driver.team.team_colour", read_only=True)
    meeting_key = serializers.IntegerField(source="session.race.meeting_key", read_only=True)
    session_key = serializers.IntegerField(source="session.session_key", read_only=True)

    class Meta:
        model = Result
        fields = [
            "meeting_key",
            "session_key",
            "driver_number",
            "full_name",
            "team_name",
            "team_colour",
            "position",
            "duration",
            "gap_to_leader",
        ]
