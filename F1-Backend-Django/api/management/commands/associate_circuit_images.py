# api/management/commands/associate_circuit_images.py
from django.core.management.base import BaseCommand
from django.core.files import File
from api.models import Race
import os

class Command(BaseCommand):
    help = "Associa immagini locali ai circuiti delle Race"

    def handle(self, *args, **kwargs):
        img_dir = os.path.join('media', 'circuit_images')
        supported_exts = ['.png', '.jpg', '.jpeg']

        # 🔹 Mappa dai nomi meeting ai nomi file
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
                    for ext in supported_exts:
                        file_candidate = f"{circuit_name}.png" if ext == '.png' else f"{circuit_name}{ext}"
                        file_path = os.path.join(img_dir, file_candidate)
                        if os.path.exists(file_path):
                            matched_file = file_candidate
                            break
                if matched_file:
                    break

            if matched_file:
                file_path = os.path.join(img_dir, matched_file)
                with open(file_path, 'rb') as f:
                    race.circuit_image.save(matched_file, File(f), save=True)
                self.stdout.write(self.style.SUCCESS(f"✅ Immagine associata a {race.meeting_name} → {matched_file}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Nessuna immagine trovata per {race.meeting_name}"))
