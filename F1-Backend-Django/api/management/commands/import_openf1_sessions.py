from django.core.management.base import BaseCommand
from api.models import Race, Session
import requests
from django.conf import settings
import json # Importa il modulo json per una migliore gestione degli errori

class Command(BaseCommand):
    help = "Importa tutte le sessioni OpenF1 per ogni meeting salvato"

    def handle(self, *args, **kwargs):

        races = Race.objects.all()
        if not races.exists():
            self.stdout.write(self.style.WARNING("⚠️ Nessuna gara trovata nel database. Assicurati di aver importato le gare prima."))
            return

        for race in races:
            url = f"https://api.openf1.org/v1/sessions?meeting_key={race.meeting_key}"
            self.stdout.write(self.style.MIGRATE_HEADING(f"Tentativo di importare sessioni per la gara: {race.meeting_name} (Meeting Key: {race.meeting_key})"))

            try:
                response = requests.get(url, timeout=10) # Aggiungi un timeout per evitare che la richiesta si blocchi indefinitamente
                response.raise_for_status() # Solleva un'eccezione per errori HTTP (4xx o 5xx)

                data = response.json()

                # Assicurati che 'data' sia una lista di dizionari
                if not isinstance(data, list):
                    self.stdout.write(self.style.ERROR(f"Errore: La risposta dell'API per meeting_key {race.meeting_key} non è un elenco. Contenuto: {data}"))
                    continue # Passa alla prossima gara

                if not data:
                    self.stdout.write(self.style.WARNING(f"Nessuna sessione trovata per la gara: {race.meeting_name} (Meeting Key: {race.meeting_key})."))
                    continue

                for item in data:
                    # Verifica che 'item' sia un dizionario prima di accedervi con chiavi stringa
                    if not isinstance(item, dict):
                        self.stdout.write(self.style.ERROR(f"Errore: Un elemento nella risposta dell'API non è un dizionario. Contenuto: {item}"))
                        continue # Salta questo elemento e continua con il prossimo

                    session_key = item.get("session_key")  # Usa .get() per gestire chiavi mancanti
                    session_type = item.get("session_type")

                    if session_key is None or session_type is None:
                        self.stdout.write(self.style.WARNING(f"Skipping session due to missing 'session_key' or 'session_type' in item: {item}"))
                        continue

                    # Il campo session_key nel tuo modello Session è un IntegerField.
                    # Assicurati che il valore sia un intero prima di passarlo.
                    try:
                        session_key = int(session_key)
                    except ValueError:
                        self.stdout.write(self.style.ERROR(f"Errore: 'session_key' non è un intero valido per l'item: {item}"))
                        continue

                    Session.objects.update_or_create(
                        session_key=session_key,
                        defaults={
                            "race": race,
                            "session_name": item.get("session_name", ""),
                            "session_type": item.get("session_type", ""),
                            "date_start": item.get("date_start")or None,
                            "circuit_short_name": item.get("circuit_short_name", ""),
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(f"  ✅ Sessione '{item.get('session_name', 'N/A')}' (Key: {session_key}) importata/aggiornata per {race.meeting_name}."))

            except requests.exceptions.HTTPError as e:
                self.stdout.write(self.style.ERROR(f"Errore HTTP durante il recupero delle sessioni per {race.meeting_name}: {e}"))
            except requests.exceptions.ConnectionError as e:
                self.stdout.write(self.style.ERROR(f"Errore di connessione durante il recupero delle sessioni per {race.meeting_name}: {e}"))
            except requests.exceptions.Timeout:
                self.stdout.write(self.style.ERROR(f"Timeout durante il recupero delle sessioni per {race.meeting_name} dall'API OpenF1."))
            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f"Errore generale della richiesta durante il recupero delle sessioni per {race.meeting_name}: {e}"))
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f"Errore di decodifica JSON per {race.meeting_name}: {e}. La risposta non era JSON valida."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Errore inatteso durante l'importazione delle sessioni per {race.meeting_name}: {e}"))

        self.stdout.write(self.style.SUCCESS("✅ Tutte le sessioni OpenF1 importate/aggiornate per le gare processate!"))