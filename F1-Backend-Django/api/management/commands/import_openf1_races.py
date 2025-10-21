from django.core.management.base import BaseCommand
from api.models import Race
import requests

class Command(BaseCommand):
    help = "Importa i Gran Premi da OpenF1"

    def handle(self, *args, **kwargs):
        url = "https://api.openf1.org/v1/meetings?year=2025"
        data = requests.get(url).json()

        for item in data:
            race, created = Race.objects.update_or_create(
            meeting_key=item["meeting_key"],
            defaults={
                "meeting_name": item.get("meeting_official_name", ""),
                "country_code": item.get("country_code", ""),
                "country_name": item.get("country_name", ""),
                "location": item.get("location", ""),
                "year": item.get("year", 2025),
                "circuit_image": item.get("circuit_image", "")
            }
        )
        circuit_image_raw = item.get("circuit_image", "")

        # Se il valore inizia con "../media/circuit_images/", estrai solo il nome del file.
        # Altrimenti, usalo così com'è, presumendo sia già un nome file pulito.
        if circuit_image_raw.startswith("../media/circuit_images/"):
            circuit_name_with_ext = circuit_image_raw.split('/')[-1] # Ottiene "Sakhir.png"
        else:
            circuit_name_with_ext = circuit_image_raw # Potrebbe essere già "Sakhir" o "Sakhir.png"
            
        # Assicurati che abbia l'estensione .png, se non è già presente
        if not circuit_name_with_ext.endswith('.png'):
            circuit_name_with_ext = f"{circuit_name_with_ext}.png"
            
        race.circuit_image = circuit_name_with_ext # Salva il nome file nel database
        race.save()

        
        self.stdout.write(self.style.SUCCESS("✅ Gran Premi importati"))
