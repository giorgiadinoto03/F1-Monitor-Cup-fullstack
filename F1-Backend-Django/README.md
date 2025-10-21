# F1-Backend-Django

Progetto Django REST per visualizzare dati F1 (weekend, sessioni, piloti, scuderie, risultati) con import da OpenF1 e filtri avanzati.

## Requisiti
- Python 3.10+ (testato con 3.12)
- pip
- Windows/macOS/Linux

## Setup Ambiente Virtuale

### Windows
```bash
cd C:\Users\giorg\Projects_Noferi\Backend_F1
python -m venv .venv
.\.venv\Scripts\activate
```

### macOS/Linux
```bash
cd /path/to/Backend_F1
python -m venv .venv
source .venv/bin/activate
```

## Installazione dipendenze
Il progetto include `requirements.txt` con tutte le dipendenze necessarie:

```bash
pip install -r requirements.txt
```

**Pacchetti principali:**
- Django 5.2.7
- djangorestframework 3.16.1
- django-filter 25.2
- requests 2.32.5 (per import da OpenF1)
- Pillow 11.3.0 (per immagini circuito)

## Configurazione iniziale DB
Il repo include `db.sqlite3` già popolato. Se vuoi ricrearlo da zero:
```bash
python manage.py makemigrations  # crea file di migrazione
python manage.py migrate         # esegue la migrazione
python manage.py createsuperuser # crea un super utente
```

## Avvio del server
```bash
python manage.py runserver
```
Server: `http://127.0.0.1:8000/`

## Struttura del progetto
- `F1_m_c/` impostazioni Django (settings, urls)
- `api/` app principale
  - `models.py`: modelli `Team`, `Driver`, `Race`, `Session`, `Result`
  - `serializers.py`: serializzatori DRF
  - `views.py`: ViewSet e azioni custom (`results/qualify`, `results/race`)
  - `filters.py`: filtri personalizzati con etichette user-friendly
  - `management/commands/`: comandi
    - `import_openf1_races.py`, `import_openf1_sessions.py`, `import_openf1_results.py`
    - `import_openf1_drivers.py`, `import_drivers.py`, `import_teams.py`
    - `associate_circuit_images.py`, `team_points.py`
  - `pagination.py`: paginazione DRF
- `media/circuit_images/`: immagini circuito
- `data/`: json di supporto

## Modelli principali (overview)
- `Team(team_name, team_colour, ... , points)`
- `Driver(number, full_name, team, country_name, points, ...)`
- `Race(meeting_key, meeting_name, country_name, location, year, circuit_image, ...)`
- `Session(race, session_key, session_name, session_type, date_start, ...)`
- `Result(session, driver, position, duration, gap_to_leader, q1, q2, q3)`

Note:
- I risultati vengono esposti già ordinati: per weekend (`meeting_key`), poi per sessione (`session_key`), dentro la sessione i classificati per `position` e i non classificati (position null) in fondo.

## API Endpoints (principali)
Base: `http://127.0.0.1:8000/api/`

- `teams/` (GET/POST/PUT/DELETE)
  - Ricerca/ordinamento: `team_name`, `points`
- `drivers/`
  - Filtri: `team__team_name`, `country_code`, `number`
  - Ricerca: `full_name`, `acronym`, `team__team_name`
  - Ordinamento: `full_name`, `points`, `number`
- `races/`
  - Filtri: `country_name`, `location`, `meeting_key`
  - Ricerca: `meeting_name`, `location`, `country_name`
- `sessions/`
  - Filtri: `race__meeting_key`, `session_type`, `session_key`
  - Ordinamento: `date_start`, `session_name`
- `results/`
  - Filtri (etichette user-friendly):
    - `Weekend (Meeting Key)` → `session__race__meeting_key`
    - `Sessione (Session Key)` → `session__session_key`
    - `Numero Pilota` → `driver__number`
    - `Posizione` → `position` (solo esatta)
  - Azioni:
    - `results/race/` (solo sessioni `Race`)
    - `results/qualify/` (solo sessioni `Qualifying`)

Esempi:
```text
/api/results/?session__race__meeting_key=1270
/api/results/race/?session__session_key=9963
```

## Import dati da OpenF1
Esegui i comandi che ti servono (puoi filtrarli/estenderli a piacere):
```bash
python manage.py import_drivers
python manage.py import_teams
python manage.py team_points
python manage.py import_openf1_drivers
python manage.py import_openf1_races
python manage.py import_openf1_sessions
python manage.py import_openf1_results
python manage.py associate_circuit_images
```

Note importanti sull’import risultati:
- I non classificati vengono salvati con `position = NULL` (non 0)
- Per le qualifiche, se `duration` manca, si usa fallback `q3`→`q2`→`q1` dato impostato in maniera specifica per le qualifiche

## Sincronizzazione punti team
Somma dei punti piloti per aggiornare i team:
```bash
python manage.py team_points
```

## Ordinamento risultati (logica)
- Ordinamento di default senza query param `ordering`:
  1. `meeting_key` (weekend)
  2. `session_key` (evento)
  3. classificati per `position`
  4. non classificati (position null) in fondo, ordinati per `duration`

## Media/Immagini circuito
- Le immagini sono in `media/circuit_images/` e collegate al campo `Race.circuit_image`.

## Admin
Pannello: `http://127.0.0.1:8000/admin/`

## Troubleshooting rapido
- Attiva l’ambiente virtuale giusto prima di installare/avviare
- Se `django_filters` o `requests` non vengono riconosciuti, reinstallali con `pip install django-filter requests`
- Se i risultati appaiono disordinati, verifica di non passare `?ordering=` nella query; in assenza di parametri, vale l’ordinamento di default.

## Idee evolutive
- Pre-calcolo e salvataggio "materializzato" delle classifiche per sessione
- Aggiunta di `updated_at`/`last_results_computed_at` per ricalcolo dei dati
- Calcolo dei punti della stagione direttamente gestito dall' backend prendendo i dati dai risultati delle gare
- **Automazione aggiornamenti con `django-crontab`**: esecuzione automatica dei comandi di import ogni X minuti/ore
- Endpoint dedicato per standings stagionali (driver/team)
- Sistema di notifiche per aggiornamenti dati

## Note per lo sviluppo
- Inserire gli import nell'ordine indicato sopra.
- Il file `requirements.txt` è già presente e aggiornato
- Usa sempre l'ambiente virtuale per evitare conflitti

## Contatti
- Repository: https://github.com/giorgiadinoto03/F1-Backend-Django
- Autore: @giorgiadinoto03
- Svolto durante il corso: ITS Prodigi - Full Stack Developers
