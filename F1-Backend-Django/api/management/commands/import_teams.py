# import_teams.py - MODIFICATO
from django.core.management.base import BaseCommand
from api.models import Team
import json
import os

class Command(BaseCommand):
    help = "Importa i team dal file JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Esporta i dati correnti nel file JSON dopo l\'import'
        )

    def handle(self, *args, **options):
        file_path = os.path.join('data', 'scuderie.json')

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
        
        # AGGIUNTA: Export automatico se richiesto
        if options['export']:
            self.export_teams_to_json()

    # AGGIUNTA: Funzione di export direttamente nella classe
    def export_teams_to_json(self):
        """Esporta tutti i team nel file JSON locale"""
        teams = Team.objects.prefetch_related('drivers').all()
        
        teams_data = []
        for team in teams:
            team_data = {
                "team_name": team.team_name,
                "team_colour": team.team_colour,
                "team_logo": team.logo_url,
                "team_livrea": team.livrea,
                "drivers": [
                    {
                        "driver_number": driver.number,
                        "full_name": driver.full_name,
                        "name_acronym": driver.acronym,
                        "headshot_url": driver.headshot_url
                    }
                    for driver in team.drivers.all()
                ]
            }
            # Rimuovi i campi None
            team_data = {k: v for k, v in team_data.items() if v is not None}
            teams_data.append(team_data)
        
        file_path = os.path.join('data', 'scuderie.json')
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(teams_data, file, indent=2, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Esportati {len(teams_data)} team nel file JSON"))