# api/management/commands/import_openf1_races.py - MODIFICA
from django.core.management.base import BaseCommand
from api.models import Race
import requests

class Command(BaseCommand):
    help = "Importa i Gran Premi da OpenF1"

    def handle(self, *args, **kwargs):
        url = "https://api.openf1.org/v1/meetings?year=2025"
        data = requests.get(url).json()

        for item in data:
            circuit_image_raw = item.get("circuit_image", "")

            # Processa il percorso dell'immagine
            if circuit_image_raw.startswith("../media/circuit_images/"):
                circuit_name_with_ext = circuit_image_raw.split('/')[-1]
            else:
                circuit_name_with_ext = circuit_image_raw
                
            # Assicurati che abbia l'estensione .png
            if circuit_name_with_ext and not circuit_name_with_ext.endswith('.png'):
                circuit_name_with_ext = f"{circuit_name_with_ext}.png"

            race, created = Race.objects.update_or_create(
                meeting_key=item["meeting_key"],
                defaults={
                    "meeting_name": item.get("meeting_official_name", ""),
                    "meeting_official_name": item.get("meeting_official_name", ""),
                    "country_code": item.get("country_code", ""),
                    "country_name": item.get("country_name", ""),
                    "location": item.get("location", ""),
                    "year": item.get("year", 2025),
                    "circuit_image": circuit_name_with_ext,
                    "circuit_image_url": item.get("circuit_image", ""),  # Salva anche l'URL originale
                    "circuit_key": item.get("circuit_key", None),
                    "date_start": item.get("date_start", None)
                }
            )

        self.stdout.write(self.style.SUCCESS("✅ Gran Premi importati"))