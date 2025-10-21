# api/management/commands/import_teams.py
from django.core.management.base import BaseCommand
from api.models import Team
import json
import os

class Command(BaseCommand):
    help = "Importa i team dal file JSON"

    def handle(self, *args, **kwargs):
        file_path = os.path.join('data', 'scuderie.json')  # percorso relativo a manage.py

        with open(file_path, 'r', encoding='utf-8') as file:
            teams_data = json.load(file)

        for item in teams_data:
            Team.objects.update_or_create(
                team_name=item['team_name'],
                defaults={
                    'team_colour': item.get('team_colour', '#000000'),
                    'logo_url': item.get('team_logo'),
                    'livrea': item.get('team_livrea'),
                    'points': 0
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Importazione dei team completata!"))
