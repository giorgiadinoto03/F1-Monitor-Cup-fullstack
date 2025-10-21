from django.core.management.base import BaseCommand
from api.models import Session, Driver, Result
import requests
from django.db.models import Q

class Command(BaseCommand):
    help = "Importa i risultati delle sessioni da OpenF1"

    def handle(self, *args, **kwargs):
        sessions = Session.objects.filter(
            Q(session_type__iexact="Race") | Q(session_type__iexact="Qualifying") | Q(session_type__iexact="Sprint")
        )
        for session in sessions:
            print(f"Importando risultati per sessione {session.session_key} ({session.session_name}) delle seguenti meeting_key: {session.race.meeting_key}")

            url = f"https://api.openf1.org/v1/session_result?session_key={session.session_key}"
            try:
                response = requests.get(url)
                data = response.json()
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Errore fetch session {session.session_key}: {e}"))
                continue
            #aggiungere url per la posizione dei piloti nel risultato (incrociare in base alla meeting_key, session_key e driver_number)
            #from urllib.request import urlopen
            #import json

            #response = urlopen(f'https://api.openf1.org/v1/position?meeting_key={session.meeting_key}&session_key={session.session_key}&driver_number={item["driver_number"]}')
            #data = json.loads(response.read().decode('utf-8'))
            #print(data)

            print(f"  -> {len(data)} risultati trovati")

            if not isinstance(data, list) or not data:
                continue

            for item in data:
                driver, _ = Driver.objects.get_or_create(
                    number=item["driver_number"],
                    defaults={
                        "full_name": item.get("full_name", f"Driver {item['driver_number']}"),
                        "broadcast_name": item.get("broadcast_name", ""),
                        "acronym": item.get("name_acronym", ""),
                        "first_name": item.get("first_name", ""),
                        "last_name": item.get("last_name", ""),
                    },
                )

                # Determina il valore del tempo da salvare
                time_value = item.get("duration")  # OpenF1 usa 'duration' al posto di 'time'
                session_type = (session.session_type or "").lower()

                # Fallback per Qualifiche: usa il miglior tempo tra Q3, poi Q2, poi Q1 se 'duration' manca
                if session_type == "qualifying" and not time_value:
                    time_value = item.get("q3") or item.get("q2") or item.get("q1")

                # Gestisci la posizione: usa None se non è presente o è 0
                position_value = item.get("position")
                if position_value is None or position_value == 0:
                    position_value = None

                existing = Result.objects.filter(session=session, driver=driver)
                if existing.exists():
                    existing.update(
                        position=position_value,
                        duration=time_value,
                        gap_to_leader=item.get("gap_to_leader", None),
                        q1=item.get("q1", None),
                        q2=item.get("q2", None),
                        q3=item.get("q3", None),
                    )
                else:
                    Result.objects.create(
                        session=session,
                        driver=driver,
                        position=position_value,
                        duration=time_value,
                        gap_to_leader=item.get("gap_to_leader", None),
                        q1=item.get("q1", None),
                        q2=item.get("q2", None),
                        q3=item.get("q3", None),
                    )


        total = Result.objects.count()
        self.stdout.write(self.style.SUCCESS(f"✅ Risultati importati con successo ({total} totali)"))
