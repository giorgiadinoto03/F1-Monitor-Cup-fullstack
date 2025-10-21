from django.core.management.base import BaseCommand
from api.models import Driver
import requests

class Command(BaseCommand):
    help = "Aggiorna driver esistenti con dati dall'API OpenF1 senza sovrascrivere immagini o dati personalizzati"

    def handle(self, *args, **kwargs):
        session_url = "https://api.openf1.org/v1/sessions?session_key=latest"
        session_data = requests.get(session_url).json()
        latest_session = session_data[0]['session_key']

        driver_url = f"https://api.openf1.org/v1/drivers?session_key={latest_session}"
        drivers = requests.get(driver_url).json()

        for item in drivers:
            try:
                driver = Driver.objects.get(number=item['driver_number'])
                driver.points = item.get('season_point', driver.points) # verifica che il json di openf1 abbia questo campo
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
