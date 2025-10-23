# import_openf1_drivers.py - MODIFICATO
from django.core.management.base import BaseCommand
from api.models import Driver
import requests
import json
import os

class Command(BaseCommand):
    help = "Aggiorna driver esistenti con dati dall'API OpenF1 senza sovrascrivere immagini o dati personalizzati"

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Esporta i dati correnti nel file JSON dopo l\'import'
        )

    def handle(self, *args, **options):
        session_url = "https://api.openf1.org/v1/sessions?session_key=latest"
        session_data = requests.get(session_url).json()
        latest_session = session_data[0]['session_key']

        driver_url = f"https://api.openf1.org/v1/drivers?session_key={latest_session}"
        drivers = requests.get(driver_url).json()

        for item in drivers:
            try:
                driver = Driver.objects.get(number=item['driver_number'])
                driver.points = item.get('season_point', driver.points)
                driver.gp_count = item.get('gp_count', driver.gp_count)
                driver.wins = item.get('wins', driver.wins)
                driver.podiums = item.get('podiums', driver.podiums)
                driver.poles = item.get('poles', driver.poles)
                # campi OpenF1
                driver.driver_ref = item.get('driver_ref', driver.driver_ref)
                driver.openf1_id = str(item.get('driver_id', driver.openf1_id))
                driver.session_key = str(latest_session)
                driver.save()
            except Driver.DoesNotExist:
                # opzionale: puoi creare nuovi driver se vuoi
                pass

        self.stdout.write(self.style.SUCCESS("✅ Merge con OpenF1 completato!"))
        
        # AGGIUNTA: Export automatico se richiesto
        if options['export']:
            self.export_drivers_to_json()

    # AGGIUNTA: Stessa funzione di export (puoi anche centralizzarla)
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
        
        self.stdout.write(self.style.SUCCESS(f"✅ Esportati {len(drivers_data)} piloti nel file JSON"))