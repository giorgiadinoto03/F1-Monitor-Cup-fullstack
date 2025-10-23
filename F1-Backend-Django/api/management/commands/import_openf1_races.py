# api/management/commands/import_openf1_races.py - CORRETTO
from django.core.management.base import BaseCommand
from api.models import Race
import requests

class Command(BaseCommand):
    help = "Importa i Gran Premi da OpenF1"

    def handle(self, *args, **kwargs):
        url = "https://api.openf1.org/v1/meetings?year=2025"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Errore nel fetch dati: {e}"))
            return

        if not data:
            self.stdout.write(self.style.WARNING("⚠️ Nessun dato ricevuto dall'API"))
            return

        for item in data:
            try:
                # Processa il percorso dell'immagine - CORRETTO per il modello attuale
                circuit_image_url = item.get("circuit_image", "")
                
                # Pulisci il percorso se necessario
                if circuit_image_url.startswith("../media/"):
                    circuit_image_url = circuit_image_url.replace("../media/", "/media/")

                # Crea o aggiorna la gara usando SOLO i campi del modello
                race, created = Race.objects.update_or_create(
                    meeting_key=item["meeting_key"],
                    defaults={
                        "meeting_name": item.get("meeting_name", ""),
                        "meeting_official_name": item.get("meeting_official_name", ""),
                        "country_code": item.get("country_code", ""),
                        "country_name": item.get("country_name", ""),
                        "location": item.get("location", ""),
                        "year": item.get("year", 2025),
                        "circuit_image_url": circuit_image_url,  # CORRETTO: usa circuit_image_url
                        "circuit_key": item.get("circuit_key", None),
                        "date_start": item.get("date_start", None),
                        "date_end": item.get("date_end", None)
                    }
                )

                action = "importata" if created else "aggiornata"
                self.stdout.write(self.style.SUCCESS(f"✅ Gara {action}: {race.meeting_name}"))

            except KeyError as e:
                self.stdout.write(self.style.ERROR(f"❌ Campo mancante in dati API: {e}"))
                continue
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Errore nell'importazione gara: {e}"))
                continue

        self.stdout.write(self.style.SUCCESS("✅ Importazione Gran Premi completata!"))