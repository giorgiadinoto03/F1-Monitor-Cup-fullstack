# api/management/commands/associate_circuit_images.py - VERSIONE DEBUG
from django.core.management.base import BaseCommand
from api.models import Race
import os

class Command(BaseCommand):
    help = "Associa immagini locali ai circuiti delle Race"

    def handle(self, *args, **kwargs):
        img_dir = 'circuit_images'
        
        circuit_map = {
            "PRE-SEASON": "Sakhir",
            "TESTING": "Sakhir",
            "BAHRAIN": "Sakhir",
            "SAUDI": "Jeddah",
            "AUSTRALIAN": "Melbourne", 
            "JAPAN": "Suzuka",
            "CHINESE": "Shanghai",
            "MIAMI": "Miami",
            "ITALIAN": "Imola",           # Per Imola
            "IMOLA": "Imola",             # Per Imola
            "EMILIA": "Imola",            # Potrebbe essere "Emilia Romagna"
            "ROMAGNA": "Imola",           # Potrebbe essere "Emilia Romagna"
            "MONACO": "Montecarlo",
            "SPAIN": "Barcelona",
            "SPANISH": "Barcelona",
            "ESPAÑA": "Barcelona",
            "ESP": "Barcelona",
            "GRAND PRIX OF SPAIN": "Barcelona",
            "CANADIAN": "Montreal",
            "AUSTRIAN": "Red_Bull_Ring",
            "BRITISH": "Silverstone",
            "HUNGARIAN": "Hungaroring",
            "BELGIAN": "SPA",
            "DUTCH": "Zandvoort",
            "ITALIA": "Monza",
            "AZERBAIJAN": "Baku",
            "SINGAPORE": "Marina_Bay",
            "UNITED STATES": "Austin",
            "MEXICO": "Mexico_City",
            "MEXICANO": "Mexico City",
            "BRAZILIAN": "Interlagos", 
            "QATAR": "Losail",
            "LAS VEGAS": "Las Vegas",
            "ABU DHABI": "Yas Marina",
        }

        for race in Race.objects.all():
            meeting_name = race.meeting_name.upper()
            self.stdout.write(f"\n🔍 Processando: '{race.meeting_name}' -> '{meeting_name}'")

            matched_file = None
            circuit_name = None
            matched_keyword = None
            
            # Cerca corrispondenza nella mappa
            for keyword, mapped_circuit in circuit_map.items():
                if keyword in meeting_name:
                    circuit_name = mapped_circuit
                    matched_keyword = keyword
                    break

            if circuit_name:
                self.stdout.write(f"   ✅ Trovata corrispondenza: '{matched_keyword}' -> '{circuit_name}'")
                
                # Prova diverse varianti del nome file
                possible_filenames = [
                    f"{circuit_name}.png",
                    f"{circuit_name.replace('_', ' ')}.png",
                    f"{circuit_name.replace(' ', '_')}.png",
                ]
                
                self.stdout.write(f"   🔍 Cerco file: {possible_filenames}")
                
                for filename in possible_filenames:
                    file_path = os.path.join('media', img_dir, filename)
                    self.stdout.write(f"   📁 Verifico: {file_path}")
                    if os.path.exists(file_path):
                        matched_file = f"{img_dir}/{filename}"
                        self.stdout.write(f"   ✅ File trovato: {matched_file}")
                        break
                    else:
                        self.stdout.write(f"   ❌ File non trovato: {file_path}")

            if matched_file:
                race.circuit_image_url = f"/media/{matched_file}"
                race.save()
                self.stdout.write(self.style.SUCCESS(f"   🎯 IMMAGINE ASSOCIATA: {race.meeting_name} → {matched_file}"))
            else:
                if circuit_name:
                    self.stdout.write(self.style.ERROR(f"   ❌ IMMAGINE NON TROVATA per: {circuit_name}"))
                else:
                    self.stdout.write(self.style.WARNING(f"   ⚠️ NESSUNA CORRISPONDENZA per: {race.meeting_name}"))

        # Statistiche finali
        races_with_images = Race.objects.exclude(circuit_image_url__isnull=True).count()
        races_without_images = Race.objects.filter(circuit_image_url__isnull=True).count()
        
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS(f"✅ Circuiti CON immagini: {races_with_images}"))
        self.stdout.write(self.style.WARNING(f"⚠️ Circuiti SENZA immagini: {races_without_images}"))
        self.stdout.write("="*60)

        if races_without_images > 0:
            self.stdout.write("\n🔍 Circuiti senza immagini:")
            for race in Race.objects.filter(circuit_image_url__isnull=True):
                self.stdout.write(f"   - '{race.meeting_name}'")