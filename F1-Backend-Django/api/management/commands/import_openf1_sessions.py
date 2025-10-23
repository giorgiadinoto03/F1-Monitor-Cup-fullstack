from django.core.management.base import BaseCommand
from api.models import Race, Session
import requests
import json

class Command(BaseCommand):
    help = "Importa tutte le sessioni OpenF1 per ogni gara salvata, comprese le Sprint"

    def handle(self, *args, **kwargs):

        races = Race.objects.all()
        if not races.exists():
            self.stdout.write(self.style.WARNING("⚠️ Nessuna gara trovata nel database. Assicurati di aver importato le gare prima."))
            return

        for race in races:
            url = f"https://api.openf1.org/v1/sessions?meeting_key={race.meeting_key}"
            self.stdout.write(self.style.MIGRATE_HEADING(f"Tentativo di importare sessioni per la gara: {race.meeting_name}"))

            try:
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                data = response.json()

                if not isinstance(data, list):
                    self.stdout.write(self.style.ERROR(f"Errore: la risposta API non è una lista. Contenuto: {data}"))
                    continue

                if not data:
                    self.stdout.write(self.style.WARNING(f"Nessuna sessione trovata per {race.meeting_name}"))
                    continue

                for item in data:
                    if not isinstance(item, dict):
                        self.stdout.write(self.style.ERROR(f"Elemento non valido nell'API: {item}"))
                        continue

                    session_key = item.get("session_key")
                    session_type = item.get("session_type")
                    session_name = item.get("session_name", "")

                    if session_key is None or session_type is None:
                        self.stdout.write(self.style.WARNING(f"Skipping session per dati incompleti: {item}"))
                        continue

                    try:
                        session_key = int(session_key)
                    except ValueError:
                        self.stdout.write(self.style.ERROR(f"'session_key' non è un intero: {item}"))
                        continue

                    # Gestione Sprint
                    if session_name.lower().startswith("sprint"):
                        # Determina il tipo corretto
                        if "qualifying" in session_type.lower():
                            session_type_db = "SPRINT_QUALIFYING"
                            session_name_db = "Sprint Qualifying"
                        else:
                            session_type_db = "SPRINT_RACE"
                            session_name_db = "Sprint Race"
                    else:
                        session_type_db = session_type
                        session_name_db = session_name

                    Session.objects.update_or_create(
                        session_key=session_key,
                        defaults={
                            "race": race,
                            "session_name": session_name_db,
                            "session_type": session_type_db,
                            "date_start": item.get("date_start") or None,
                            "circuit_short_name": item.get("circuit_short_name", "")
                        }
                    )

                    self.stdout.write(self.style.SUCCESS(f"  ✅ Sessione '{session_name_db}' ({session_type_db}) importata/aggiornata"))

            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f"Errore fetch sessioni per {race.meeting_name}: {e}"))
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f"Errore decodifica JSON per {race.meeting_name}: {e}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Errore inatteso import session per {race.meeting_name}: {e}"))

        self.stdout.write(self.style.SUCCESS("✅ Tutte le sessioni OpenF1 importate/aggiornate!"))
