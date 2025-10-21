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

class RaceSerializer(serializers.ModelSerializer):
    date_start = serializers.SerializerMethodField()
    date_end = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Race
        fields = [
            "meeting_key",
            "meeting_name",
            "location",
            "country_name",
            "date_start",
            "date_end",
            "image_url",
            "year",
            "circuit_key",
        ]

    def get_date_start(self, obj):
        value = getattr(obj, "first_session_date", None)
        if value is None:
            value = obj.sessions.aggregate(v=Min("date_start"))["v"]
        return value

    def get_date_end(self, obj):
        value = getattr(obj, "last_session_date", None)
        if value is None:
            value = obj.sessions.aggregate(v=Max("date_start"))["v"]
        return value

    def get_image_url(self, obj):
        # 1) URL esterno o campo diretto
        value = getattr(obj, "image_url", None) or getattr(obj, "image", None)
        if value and isinstance(value, str):
            return value
        # 2) ImageField locale (es. circuit_image)
        image_field = getattr(obj, "circuit_image", None)
        if image_field:
            if hasattr(image_field, "url"):
                request = self.context.get("request")
                url = image_field.url
                return request.build_absolute_uri(url) if request else url
            # Caso: nel DB solo nome file
            filename = str(image_field)
            if filename:
                request = self.context.get("request")
                base = request.build_absolute_uri("/") if request else "/"
                return f"{base.rstrip('/')}/media/circuit_images/{filename.lstrip('/')}"
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
