# api/management/commands/associate_circuit_images.py
from django.core.management.base import BaseCommand
from api.models import Race
import os

class Command(BaseCommand):
    help = "Associa immagini locali ai circuiti delle Race"

    def handle(self, *args, **kwargs):
        img_dir = 'circuit_images'  # Cartella relativa dentro media
        
        circuit_map = {
            "BAHRAIN": "Sakhir",
            "SAUDI": "Jeddah",
            "AUSTRALIAN": "Melbourne", 
            "JAPANESE": "Sazuka",
            "CHINESE": "Shanghai",
            "MIAMI": "Miami",
            "EMILIA-ROMAGNA": "Imola",
            "MONACO": "Montecarlo",
            "ESPAÑA": "Barcellona",
            "CANADA": "Montreal",
            "AUSTRIAN": "Red Bull Ring",
            "BRITISH": "Silverstone",
            "HUNGARIAN": "Hungaroring",
            "BELGIAN": "SPA",
            "DUTCH": "Zandvoort",
            "ITALIA": "Monza",
            "AZERBAIJAN": "Baku",
            "SINGAPORE": "Marina Bay",
            "UNITED STATES": "Austin",
            "MEXICO": "Mexico City",
            "BRAZILIAN": "Interlagos", 
            "QATAR": "Losail",
            "LAS VEGAS": "Las Vegas",
            "ABU DHABI": "Yas Marina",
        }

        for race in Race.objects.all():
            meeting_name = race.meeting_name.upper()

            matched_file = None
            for keyword, circuit_name in circuit_map.items():
                if keyword in meeting_name:
                    # Controlla se il file esiste
                    file_path = os.path.join('media', img_dir, f"{circuit_name}.png")
                    if os.path.exists(file_path):
                        matched_file = f"{img_dir}/{circuit_name}.png"
                        break

            if matched_file:
                # Salva solo il percorso, non il file
                race.circuit_image = matched_file
                race.save()
                self.stdout.write(self.style.SUCCESS(f"✅ Immagine associata a {race.meeting_name} → {matched_file}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Nessuna immagine trovata per {race.meeting_name}"))