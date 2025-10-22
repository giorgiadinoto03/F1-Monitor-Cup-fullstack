
from django.core.management.base import BaseCommand
from api.models import Driver, Team
import json
import os

class Command(BaseCommand):
    help = "Importa i piloti e i team dal file JSON"

    def handle(self, *args, **kwargs):
        file_path = os.path.join('data', 'piloti.json')  # percorso relativo a manage.py

        with open(file_path, 'r', encoding='utf-8') as file:
            drivers_data = json.load(file)

        for item in drivers_data:
            # 1️⃣ Recupera o crea il team collegato
            team_name = item.get('team_name')
            team_colour = item.get('team_colour')

            team_obj = None
            if team_name:  # solo se esiste nel JSON
                team_obj, _ = Team.objects.get_or_create(
                    team_name=team_name,
                    defaults={'team_colour': team_colour or '#000000'}
                )

            # 2️⃣ Crea o aggiorna il driver, collegandolo al team
            Driver.objects.update_or_create(
                number=item['driver_number'],
                defaults={
                    'points': item.get('season_point', 0), #nel model cerca il campo points e lo aggiorna con il valore di season_point
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
                    # OpenF1 fields lasciati vuoti, da aggiornare solo in merge
                    'driver_ref': item.get('driver_ref', ''),
                    'openf1_id': str(item.get('driver_id', '')),
                    'session_key': str(item.get('session_key', '')),
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Importazione completata con team collegati!"))
