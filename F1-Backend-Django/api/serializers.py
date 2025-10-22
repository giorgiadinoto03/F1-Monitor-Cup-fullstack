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
        # CORREGGI: usa headshot_url dal modello
        if obj.headshot_url:
            return obj.headshot_url
        return None

# api/serializers.py - MODIFICA RaceSerializer
class RaceSerializer(serializers.ModelSerializer):
    circuit_image_url = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    meeting_official_name = serializers.SerializerMethodField()

    def get_circuit_image_url(self, obj):
        # Prima prova con circuit_image_url
        if obj.circuit_image_url:
            request = self.context.get('request')
            if request and not obj.circuit_image_url.startswith('http'):
                return request.build_absolute_uri(obj.circuit_image_url)
            return obj.circuit_image_url
        
        # Fallback su circuit_image
        if obj.circuit_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/media/{obj.circuit_image}')
            return f'/media/{obj.circuit_image}'
        return None
    
    def get_start_date(self, obj):
        # 🔥 CORREGGI: usa l'annotazione first_session_date invece di fare una query
        if hasattr(obj, 'date_start'):
            return obj.date_start
        
        # Fallback: query tradizionale
        first_session = obj.sessions.order_by('date_start').first()
        return first_session.date_start if first_session else obj.date_start
    
    def get_meeting_official_name(self, obj):
        return f"FORMULA 1 {obj.meeting_name.upper()} {obj.year}"
    
    class Meta:
        model = Race
        fields = [
            'meeting_key', 'meeting_name', 'meeting_official_name',
            'location', 'country_name', 'year', 'circuit_key',
            'circuit_image_url', 'start_date'
        ]

class NextRaceSerializer(serializers.ModelSerializer):
    circuit_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Race
        fields = [
            'meeting_key', 'meeting_name', 'meeting_official_name',
            'location', 'country_name', 'date_start', 'date_end', 
            'circuit_image', 'year', 'circuit_key'
        ]
    
    def get_circuit_image(self, obj):
        # Usa circuit_image_url come sorgente per circuit_image
        if obj.circuit_image_url:
            request = self.context.get('request')
            if request and not obj.circuit_image_url.startswith('http'):
                return request.build_absolute_uri(obj.circuit_image_url)
            return obj.circuit_image_url
        
        # Fallback su circuit_image
        if obj.circuit_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/media/{obj.circuit_image}')
            return f'/media/{obj.circuit_image}'
        return None

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
    headshot_url = serializers.CharField(source="driver.circuit_image", read_only=True)
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
