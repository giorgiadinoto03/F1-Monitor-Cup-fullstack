# F1 Monitor Cup 

## Descrizione del Progetto
F1 Monitor Cup è un'applicazione web full-stack dedicata al monitoraggio della stagione di Formula 1 2025. Il progetto permette di visualizzare classifiche in tempo reale, informazioni dettagliate su piloti e scuderie, risultati delle sessioni di gara e statistiche complete.
L'applicazione si compone di:

- Backend Django REST: API per la gestione e l'elaborazione dei dati F1
- Frontend React: interfaccia utente moderna e responsive
- Database PostgreSQL: gestione persistente dei dati
- Integrazione OpenF1 API: importazione automatica dei dati ufficiali
- Docker Compose: orchestrazione completa dell'ambiente

-----
## Tecnologie e Architettura

### Frontend
- React 19.1.1 - Libreria UI
- Material-UI (MUI) 7.3.2 - Componenti UI
- React Router 7.9.1 - Routing
- Vite 7.1.6 - Build tool e dev server

### Backend
Il backend è sviluppato con Django 5.2.7 e Django REST Framework 3.16.1, fornendo un'API RESTful completa per la gestione dei dati della stagione di Formula 1 2025.

Django 5.2.7 - Framework web Python
Django REST Framework 3.16.1 - API REST
PostgreSQL 15 - Database relazionale
Django CORS Headers 4.9.0 - Gestione CORS
Django Filter 25.2 - Sistema di filtri avanzati
Requests 2.32.5 - HTTP client per OpenF1 API
Pillow 12.0.0 - Gestione immagini

#### Infrastruttura

Docker & Docker Compose - Containerizzazione e orchestrazione
Vite Dev Server - Hot reload frontend
Django Development Server - Backend development

## Struttura del Progetto
```
F1-Monitor-Cup/
├── F1-Backend-Django/          # Backend Django
│   ├── api/                    # App principale
│   │   ├── models.py          # Modelli database
│   │   ├── serializers.py     # Serializzatori DRF
│   │   ├── views.py           # ViewSets API
│   │   ├── filters.py         # Filtri personalizzati
│   │   ├── admin.py           # Configurazione Django Admin
│   │   └── management/        # Comandi personalizzati
│   │       └── commands/
│   │           ├── import_drivers.py
│   │           ├── import_teams.py
│   │           ├── import_openf1_races.py
│   │           ├── import_openf1_sessions.py
│   │           ├── import_openf1_results.py
│   │           ├── calculated_driver_points.py
│   │           └── import_all_openf1.py
│   ├── F1_m_c/                # Configurazione progetto
│   │   ├── settings.py
│   │   └── urls.py
│   ├── media/                 # Immagini circuiti
│   ├── data/                  # File JSON locali
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
│
├── F1-Frontend-React/         # Frontend React
│   ├── src/
│   │   ├── components/        # Componenti riutilizzabili
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── PilotiCard.jsx
│   │   │   └── SideImage.jsx
│   │   ├── Routes/            # Pagine principali
│   │   │   ├── HomePage.jsx
│   │   │   ├── Piloti.jsx
│   │   │   ├── Scuderie.jsx
│   │   │   └── Gp2025.jsx
│   │   ├── services/
│   │   │   └── api.jsx        # Client API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml         # Orchestrazione container
```

## Installazione e Setup
### Opzione 1: Installazione Locale (Senza Docker)

#### Requisiti

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### Passaggi di installazione e configurazione
```
git clone https://github.com/giorgiadinoto03/F1-Monitor-Cup-fullstack.git
cd F1-Monitor-Cup
```

#### Configurazione Backend
```
cd F1-Backend-Django

# Creazione ambiente virtuale
python -m venv .venv

# Attivazione ambiente virtuale
# Linux/Mac:
source .venv/bin/activate
# Windows:
source .venv\Scripts\activate

# Installazione dipendenze
pip install -r requirements.txt

# Migrazioni database
python manage.py makemigrations
python manage.py migrate
```

##### Importazione dati Importanti
```
python manage.py import_drivers
python manage.py import_teams

python manage.py import_all_openf1 --year 2025 -> Serve a importare races, sessions, results, calcolo punti e associare immagini ai circuiti in un unico comando

# Oppure importare singolarmente
python manage.py import_openf1_races
python manage.py import_openf1_sessions
python manage.py import_openf1_results

python manage.py calculated_driver_points -> calcolo dei punti dei piloti e delle scuderie

python manage.py associate_circuit_images -> importa e associa le immagini dei circuiti

python manage.py export_data ->  Esporta i dati in JSON se modificati nella sezione admin
```

##### Avvio Server Backend
```
python manage.py runserver
```


#### Configurazione Frontend
```
cd F1-Frontend-React

# Installazione dipendenze
npm install

# Avvio sviluppo
npm run dev
```

### Opzione 2: Avvio con Docker
#### Requisiti 
- Docker
- Docker Compose 

#### Passaggi di installazione e configurazione
```
git clone https://github.com/giorgiadinoto03/F1-Monitor-Cup-fullstack.git
cd F1-Monitor-Cup

# Avvio di tutti i servizi
docker-compose up --build
```

### Comandi Docker Utili
```
# Avvio in background
docker-compose up -d

# Fermare i container
docker-compose down

# Visualizzare i log
docker-compose logs

# Visualizzare lo stato dei container
docker-compose ps

# Ricostruire i container
docker-compose build
```

## Accesso all'Applicazione
- Frontend: http://localhost:5173/
- Backend: http://localhost:8000/
- API Backend: http://localhost:8000/api/
- ADMIN Backend: http://localhost:8000/admin/

### Importazione dati Importanti su docker
```
docker-compose exec backend python manage.py import_drivers
docker-compose exec backend python manage.py import_teams

docker-compose exec backend python manage.py import_all_openf1 --year 2025 

#oppure importare singolarmente
docker-compose exec backend python manage.py import_openf1_races
docker-compose exec backend python manage.py import_openf1_sessions
docker-compose exec backend python manage.py import_openf1_results

docker-compose exec backend python manage.py calculated_driver_points
docker-compose exec backend python manage.py associate_circuit_images
```
### API Principali x Backend

- Scuderie --> "http://127.0.0.1:8000/api/teams/",
- Piloti --> "http://127.0.0.1:8000/api/drivers/",
- Gare --> "http://127.0.0.1:8000/api/races/",
- Sessioni --> "http://127.0.0.1:8000/api/sessions/",
- Risultati --> "http://127.0.0.1:8000/api/results/",
- Prossima gara --> "http://127.0.0.1:8000/api/races/next/"


## Integrazioni Future 

- Login Utenti : Inserimento di autenticazione e login per utenti per poter far scegliere una Scuderia e un Pilota preferito, mostrando dati nel dettaglio di quel pilota e di quella scuderia.
- Grafiche con Statistiche e dell'andamento dei piloti a livello di prestazione.
- Aggiornamenti automatici dei dati a fine sessione o in un giorno e un orario stabilito.

## Autore
**Giorgia Di Noto**
Progetto sviluppato durante il corso Fullstack Developer

## Note Tecniche
- L'import da OpenF1 API può richiedere alcuni minuti per l'import dei risultati per ogni sessione.
- Le immagini dei circuiti devono essere posizionate esattamente nella cartella `media/circuit_images/`.
- Calcolo punti piloti e scuderie da eseguire manualemnte in vista di un futuro inserimento di aggiornamento dati automatici.


**Versione:** demo 1.2
**Ultimo Aggioranto:** 04/11/2025 - 04 Novembre 2025
