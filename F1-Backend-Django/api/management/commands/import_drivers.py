# import_drivers.py - MODIFICATO
from django.core.management.base import BaseCommand
from api.models import Driver, Team
import json
import os

class Command(BaseCommand):
    help = "Importa i piloti e i team dal file JSON"

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Esporta i dati correnti nel file JSON dopo l\'import'
        )

    def handle(self, *args, **options):
        file_path = os.path.join('data', 'piloti.json')
        
        with open(file_path, 'r', encoding='utf-8') as file:
            drivers_data = json.load(file)

        for item in drivers_data:
            team_name = item.get('team_name')
            team_colour = item.get('team_colour')

            team_obj = None
            if team_name:
                team_obj, _ = Team.objects.get_or_create(
                    team_name=team_name,
                    defaults={'team_colour': team_colour or '#000000'}
                )

            Driver.objects.update_or_create(
                number=item['driver_number'],
                defaults={
                    'points': item.get('season_point', 0),
                    'broadcast_name': item.get('broadcast_name', ''),
                    'full_name': item.get('full_name', ''),
                    'acronym': item.get('name_acronym', ''),
                    'team': team_obj,
                    'first_name': item.get('first_name', ''),
                    'last_name': item.get('last_name', ''),
                    'headshot_url': item.get('headshot_url', ''),
                    'country_code': item.get('country_code', ''),
                    'country_name': item.get('country_name', ''),
                    'gp_count': item.get('gp_count', 0),
                    'poles': item.get('poles', 0),
                    'podiums': item.get('podiums', 0),
                    'wins': item.get('wins', 0),
                    'driver_ref': item.get('driver_ref', ''),
                    'openf1_id': str(item.get('driver_id', '')),
                    'session_key': str(item.get('session_key', '')),
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Importazione completata con team collegati!"))
        
        # AGGIUNTA: Export automatico se richiesto
        if options['export']:
            self.export_drivers_to_json()

    # AGGIUNTA: Funzione di export direttamente nella classe
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
            # Rimuovi i campi None per pulizia
            driver_data = {k: v for k, v in driver_data.items() if v is not None}
            drivers_data.append(driver_data)
        
        file_path = os.path.join('data', 'piloti.json')
        with open(file_path, 'w', encoding='utf-8') as file:
            json.dump(drivers_data, file, indent=2, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Esportati {len(drivers_data)} piloti nel file JSON"))