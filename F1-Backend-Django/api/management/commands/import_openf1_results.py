# api/management/commands/import_openf1_results.py
import requests
import time
from django.core.management.base import BaseCommand
from api.models import Session, Driver, Result


class Command(BaseCommand):
    help = "Importa i risultati delle sessioni da OpenF1 (versione unificata compatta e stabile)"

    def handle(self, *args, **options):
        sessions = Session.objects.all()

        for session in sessions:
            self.stdout.write(
                f"\nImportando risultati per sessione {session.session_key} ({session.session_type}) "
                f"→ meeting_key: {session.race.meeting_key}"
            )

            try:
                # ✅ Chiamata API corretta con meeting_key e session_key
                response = requests.get(
                    f"https://api.openf1.org/v1/position?meeting_key={session.race.meeting_key}&session_key={session.session_key}",
                    timeout=10
                )
                response.raise_for_status()
                data = response.json()

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Errore fetch session {session.session_key}: {e}"))
                continue

            if not isinstance(data, list) or not data:
                self.stdout.write(self.style.WARNING("Nessun risultato trovato... Passa alla prossima sessione."))
                continue

            self.stdout.write(self.style.SUCCESS(f"  → {len(data)} risultati trovati"))

            for item in data:
                driver_number = item.get("driver_number")
                if not driver_number:
                    continue

                # ✅ Trova o crea il pilota
                driver, _ = Driver.objects.get_or_create(
                    number=driver_number,
                    defaults={
                        "full_name": item.get("full_name", f"Driver {driver_number}"),
                        "broadcast_name": item.get("broadcast_name", ""),
                        "acronym": item.get("name_acronym", ""),
                        "first_name": item.get("first_name", ""),
                        "last_name": item.get("last_name", ""),
                    },
                )

                # ✅ Determina durata o tempi qualifiche
                time_value = item.get("duration")
                session_type = (session.session_type or "").lower()
                if session_type == "qualifying" and not time_value:
                    time_value = item.get("q3") or item.get("q2") or item.get("q1")

                # ✅ Gestisci posizione
                position_value = item.get("position") or None
                if position_value == 0:
                    position_value = None

                # ✅ Crea o aggiorna risultato
                result, created = Result.objects.update_or_create(
                    session=session,
                    driver=driver,
                    defaults={
                        "position": position_value,
                        "duration": time_value,
                        "gap_to_leader": item.get("gap_to_leader"),
                        "q1": item.get("q1"),
                        "q2": item.get("q2"),
                        "q3": item.get("q3"),
                    },
                )

            # ✅ Pausa minima tra le chiamate per non stressare l'API
            time.sleep(0.1)

        total = Result.objects.count()
        self.stdout.write(self.style.SUCCESS(f"\n✅ Importazione completata con successo ({total} risultati totali)"))
