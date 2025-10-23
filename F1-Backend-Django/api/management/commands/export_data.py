# api/management/commands/export_data.py (nuovo file)
from django.core.management.base import BaseCommand
from api.models import Driver, Team
import json
import os

class Command(BaseCommand):
    help = "Esporta i dati correnti nei file JSON locali"

    def add_arguments(self, parser):
        parser.add_argument(
            '--drivers',
            action='store_true',
            help='Esporta solo i piloti'
        )
        parser.add_argument(
            '--teams', 
            action='store_true',
            help='Esporta solo i team'
        )

    def handle(self, *args, **options):
        export_drivers = options['drivers']
        export_teams = options['teams']
        
        # Se non sono specificati, esporta tutto
        if not export_drivers and not export_teams:
            export_drivers = export_teams = True

        if export_drivers:
            self.export_drivers_to_json()

        if export_teams:
            self.export_teams_to_json()

    def export_drivers_to_json(self):
        """Esporta tutti i piloti nel file JSON locale"""
        drivers = Driver.objects.select_related('team').all()
        
        drivers_data = []
        for driver in drivers:
            driver_data = {
                "season_point": driver.points,
                "driver_number": driver.number,
                "broadcast_name": driver.broadcast_name,
                "full_name": driver.full_name,
                "name_acronym": driver.acronym,
                "team_name": driver.team.team_name if driver.team else None,
                "team_colour": driver.team.team_colour if driver.team else None,
                "first_name": driver.first_name,
                "last_name": driver.last_name,
                "headshot_url": driver.headshot_url,
                "country_code": driver.country_code,
                "country_name": driver.country_name,
                "gp_count": driver.gp_count,
                "poles": driver.poles,
                "podiums": driver.podiums,
                "wins": driver.wins,
                "driver_ref": driver.driver_ref,
                "driver_id": driver.openf1_id,
                "session_key": driver.session_key,
            }
            driver_data = {k: v for k, v in driver_data.items() if v is not None}
            drivers_data.append(driver_data)
        
        file_path = os.path.join('data', 'piloti.json')
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(drivers_data, file, indent=2, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Esportati {len(drivers_data)} piloti in data/piloti.json"))

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
            team_data = {k: v for k, v in team_data.items() if v is not None}
            teams_data.append(team_data)
        
        file_path = os.path.join('data', 'scuderie.json')
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(teams_data, file, indent=2, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Esportati {len(teams_data)} team in data/scuderie.json"))