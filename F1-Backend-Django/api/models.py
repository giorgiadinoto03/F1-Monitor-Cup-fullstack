# api/models.py
from django.db import models

class Team(models.Model):
    team_name = models.CharField(max_length=100, unique=True)
    team_colour = models.CharField(max_length=10, blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    livrea = models.URLField(blank=True, null=True)
    points = models.IntegerField(default=0)

    def __str__(self):
        return self.team_name


class Driver(models.Model):
    number = models.IntegerField(unique=True)
    broadcast_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=200)
    acronym = models.CharField(max_length=50)
    team = models.ForeignKey('Team', on_delete=models.SET_NULL, related_name='drivers', blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    headshot_url = models.URLField(blank=True, null=True)
    country_code = models.CharField(max_length=10, blank=True, null=True)
    country_name = models.CharField(max_length=50, blank=True, null=True)
    gp_count = models.IntegerField(default=0)
    poles = models.IntegerField(default=0)
    podiums = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    points = models.IntegerField(default=0)

    # OpenF1 specific
    driver_ref = models.CharField(max_length=100, blank=True, null=True)
    openf1_id = models.CharField(max_length=50, blank=True, null=True)
    session_key = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.number} - {self.full_name}"


class Race(models.Model):
    meeting_key = models.IntegerField(unique=True)
    meeting_name = models.CharField(max_length=200)
    meeting_official_name = models.CharField(max_length=200, blank=True, null=True)  # Aggiungi questo
    country_code = models.CharField(max_length=50, blank=True, null=True)
    country_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    year = models.IntegerField()
    circuit_image_url = models.CharField(max_length=255, blank=True, null=True)
    circuit_key = models.IntegerField(blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)  # Aggiungi per races/next
    date_end = models.DateTimeField(blank=True, null=True)  # Aggiungi per races/next

    def __str__(self):
        return f"{self.meeting_name} ({self.year})"


class Session(models.Model):
    race = models.ForeignKey(Race, on_delete=models.CASCADE, related_name="sessions")
    session_key = models.IntegerField(unique=True)
    session_name = models.CharField(max_length=100, blank=True, null=True)
    session_type = models.CharField(max_length=50)
    date_start = models.DateTimeField(blank=True, null=True)
    circuit_short_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.session_name} ({self.race.meeting_name})"


class Result(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="results")
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="results")
    position = models.IntegerField(blank=True, null=True)
    duration = models.CharField(max_length=50, blank=True, null=True)
    gap_to_leader = models.CharField(max_length=50, blank=True, null=True)
    q1 = models.CharField(max_length=50, blank=True, null=True)
    q2 = models.CharField(max_length=50, blank=True, null=True)
    q3 = models.CharField(max_length=50, blank=True, null=True)
    
    # Status flags from OpenF1 API
    dnf = models.BooleanField(default=False)  # Did Not Finish
    dns = models.BooleanField(default=False)  # Did Not Start
    dsq = models.BooleanField(default=False)  # Disqualified
    best_lap_time = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        # Aggiungi questi indici per migliorare le performance delle query comuni
        indexes = [
            models.Index(fields=['session', 'driver']), # Utile per query su sessione e driver specifici
            models.Index(fields=['session', 'position']), # Utile per ordinare i risultati di una sessione per posizione
            models.Index(fields=['driver', 'position']), # Utile per trovare i risultati di un driver specifico in base alla posizione
        ]

    def __str__(self):
        return f"{self.session.session_name} - {self.driver.full_name} ({self.position})"