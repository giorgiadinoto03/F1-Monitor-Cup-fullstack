# import_openf1_results.py - VERSIONE CON GESTIONE DNF/DNS/DSQ E POSIZIONI 1-20
import requests
import time
from django.core.management.base import BaseCommand
from api.models import Session, Driver, Result

class Command(BaseCommand):
    help = "Importa i risultati delle sessioni da OpenF1 con gestione DNF/DNS/DSQ"

    def handle(self, *args, **options):
        sessions = Session.objects.all()

        for session in sessions:
            self.stdout.write(f"\nImportando risultati per sessione {session.session_key} ({session.session_name}) "
                              f"→ gara: {session.race.meeting_name}")

            try:
                # USA SESSION_RESULT - contiene tutti i dati completi
                response = requests.get(
                    f"https://api.openf1.org/v1/session_result?session_key={session.session_key}",
                    timeout=10
                )
                response.raise_for_status()
                data = response.json()

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Errore fetch session {session.session_key}: {e}"))
                continue

            if not isinstance(data, list) or not data:
                self.stdout.write(self.style.WARNING("  ⚠️ Nessun risultato trovato... Passa alla prossima sessione."))
                continue

            self.stdout.write(self.style.SUCCESS(f"  → {len(data)} risultati trovati"))

            # Separiamo i piloti classificati da quelli non classificati
            classified_drivers = []
            unclassified_drivers = []

            for item in data:
                driver_number = item.get("driver_number")
                if not driver_number:
                    continue

                # Cerca il driver
                try:
                    driver = Driver.objects.get(number=driver_number)
                except Driver.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"  ⚠️ Driver {driver_number} non trovato, salto..."))
                    continue

                # 🔥 CORREZIONE: Leggi i flag DNF/DNS/DSQ dall'API
                dnf = item.get("dnf", False)
                dns = item.get("dns", False)
                dsq = item.get("dsq", False)
                position = item.get("position")

                # Determina se il pilota è classificato (posizione tra 1 e 20)
                if position is not None and 1 <= position <= 20 and not dnf and not dns and not dsq:
                    classified_drivers.append((driver, item, position))
                else:
                    # Pilota non classificato - determina lo stato
                    if dsq:
                        status = "DSQ"
                    elif dns:
                        status = "DNS"
                    elif dnf:
                        status = "DNF"
                    else:
                        status = "NC"  # Not Classified
                    unclassified_drivers.append((driver, item, status))

            # Ordina i piloti classificati per posizione
            classified_drivers.sort(key=lambda x: x[2])

            # Combina tutte le liste nell'ordine corretto
            all_drivers = classified_drivers + unclassified_drivers

            # Assegna le posizioni finali
            final_position = 1
            for driver_data in all_drivers:
                driver, item, status_or_position = driver_data
                
                # DEBUG: Mostra i dati ricevuti
                self.stdout.write(f"  🔍 Driver {driver.number} - {driver.full_name}: {item}")

                # 🔥 CORREZIONE: Leggi di nuovo i flag per ogni pilota
                dnf = item.get("dnf", False)
                dns = item.get("dns", False)
                dsq = item.get("dsq", False)
                position = item.get("position")

                # POSIZIONE FINALE
                if isinstance(status_or_position, int):
                    # Pilota classificato - mantiene la posizione originale (1-20)
                    position_value = status_or_position
                else:
                    # Pilota non classificato - posizione None
                    position_value = None

                # GESTIONE DURATION E GAP - DISTINGUI TRA ARRAY E VALORI SINGOLI
                duration_raw = item.get("duration")
                gap_raw = item.get("gap_to_leader")
                
                # Inizializza i valori
                duration_value = None
                gap_value = None
                q1_value = None
                q2_value = None
                q3_value = None

                # Se duration è un array (qualifiche)
                if isinstance(duration_raw, list):
                    q1_value = duration_raw[0] if len(duration_raw) > 0 and duration_raw[0] is not None else None
                    q2_value = duration_raw[1] if len(duration_raw) > 1 and duration_raw[1] is not None else None
                    q3_value = duration_raw[2] if len(duration_raw) > 2 and duration_raw[2] is not None else None
                    
                    # Per le qualifiche, duration è il miglior tempo (q3 o l'ultimo disponibile)
                    duration_value = q3_value or q2_value or q1_value
                
                # Se duration è un valore singolo (gare)
                else:
                    duration_value = duration_raw

                # Se gap_to_leader è un array (qualifiche)
                if isinstance(gap_raw, list):
                    # Per le qualifiche, prendi l'ultimo gap disponibile
                    gap_value = gap_raw[2] if len(gap_raw) > 2 and gap_raw[2] is not None else gap_raw[1] if len(gap_raw) > 1 and gap_raw[1] is not None else gap_raw[0] if len(gap_raw) > 0 and gap_raw[0] is not None else None
                
                # Se gap_to_leader è un valore singolo (gare)
                else:
                    gap_value = gap_raw

                # Se è una qualifica e non abbiamo i tempi nei campi q1/q2/q3, ma abbiamo duration come array
                session_type_lower = (session.session_type or "").lower()
                if session_type_lower in ["qualifying", "sprint_qualifying"]:
                    # Se abbiamo già impostato q1/q2/q3 dall'array, non fare nulla
                    # Altrimenti, se duration è un array, usalo per impostare q1/q2/q3
                    if isinstance(duration_raw, list) and not any([q1_value, q2_value, q3_value]):
                        q1_value = duration_raw[0] if len(duration_raw) > 0 else None
                        q2_value = duration_raw[1] if len(duration_raw) > 1 else None
                        q3_value = duration_raw[2] if len(duration_raw) > 2 else None

                # 🔥 CORREZIONE: Crea o aggiorna il risultato con i flag DNF/DNS/DSQ
                result, created = Result.objects.update_or_create(
                    session=session,
                    driver=driver,
                    defaults={
                        "position": position_value,
                        "duration": duration_value,
                        "gap_to_leader": gap_value,
                        "q1": q1_value,
                        "q2": q2_value,
                        "q3": q3_value,
                        # 🔥 SALVA I FLAG DNF/DNS/DSQ
                        "dnf": dnf,
                        "dns": dns,
                        "dsq": dsq
                    }
                )

                # Determina lo status per il log
                if dsq:
                    status_display = "DSQ"
                elif dns:
                    status_display = "DNS"
                elif dnf:
                    status_display = "DNF"
                elif position_value:
                    status_display = f"P{position_value}"
                else:
                    status_display = "NC"

                action = "creato" if created else "aggiornato"
                self.stdout.write(f"  ✅ Risultato {action} per {driver.full_name}: "
                                f"{status_display}, DNF={dnf}, DNS={dns}, DSQ={dsq}, "
                                f"durata={duration_value}, gap={gap_value}, "
                                f"q1={q1_value}, q2={q2_value}, q3={q3_value}")

                final_position += 1

            time.sleep(0.1)  # pausa tra chiamate API

        total = Result.objects.count()
        self.stdout.write(self.style.SUCCESS(f"\n✅ Importazione completata con successo ({total} risultati totali)"))