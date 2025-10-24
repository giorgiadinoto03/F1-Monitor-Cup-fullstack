# F1 Monitor Cup 

## Descrizione del Progetto
F1 Monitor Cup è un'applicazione web full-stack dedicata al monitoraggio della stagione di Formula 1 2025. Il progetto permette di visualizzare classifiche in tempo reale, informazioni dettagliate su piloti e scuderie, risultati delle sessioni di gara e statistiche complete.

L'applicazione si compone di:
- Backend Django REST: API per la gestione e l'elaborazione dei dati F1
- Frontend React: interfaccia utente moderna e responsive
- Integrazione OpenF1 API: importazione automatica dei dati ufficiali

-----
## Tecnologie e Architettura

### Frontend
React 19.1.1 - Libreria UI
Material-UI (MUI) 7.3.2 - Componenti UI
React Router 7.9.1 - Routing
Vite 7.1.6 - Build tool e dev server

### Backend
Django 5.2.7 - Framework web Python
Django REST Framework 3.16.1 - API REST
Django CORS Headers 4.9.0 - Gestione CORS
Django Filter 25.2 - Sistema di filtri avanzati
Requests 2.32.5 - HTTP client per OpenF1 API
Pillow 12.0.0 - Gestione immagini

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
│   ├── manage.py
│   └── requirements.txt
│
└── F1-Frontend-React/         # Frontend React
    ├── src/
    │   ├── components/        # Componenti riutilizzabili
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── SessionCard.jsx
    │   │   ├── PilotiCard.jsx
    │   │   └── SideImage.jsx
    │   ├── Routes/            # Pagine principali
    │   │   ├── HomePage.jsx
    │   │   ├── Piloti.jsx
    │   │   ├── Scuderie.jsx
    │   │   └── Gp2025.jsx
    │   ├── services/
    │   │   └── api.jsx        # Client API
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Installazione e Setup
### Requisiti
- Python 3.10+
- Node.js 18+ e npm

### Passaggi di installazione e configurazione
```
git clone https://github.com/[TUO_USERNAME]/F1-Monitor-Cup.git
cd F1-Monitor-Cup
```
#### Avvio Frontend
```
cd F1-Frontend-React
npm install
npm run dev
```

#### Avvio Backend
```
cd F1-Backend-Django
python -m venv .venv  -> crea l'ambiente virtuale
source .venv/bin/activate  -> attiva l'ambiente virtuale su Linux
source .venv/Scripts/activate  -> attiva l'ambiente virtuale su Windows

pip install -r requirements.txt -> installa le dipendenzeù

python manage.py makemigrations
python manage.py migrate

```
##### Importazione dati Importanti
```
python manange.py import_drivers
python manange.py import_teams

python manange.py import_all_openf1 --year 2025 -> comando che serve a importare races, sessions, results e calcolo punti in un'unica volta

python manange.py import_openf1_races
python manange.py import_openf1_sessions
python manange.py import_openf1_results

python manange.py calculated_driver_points -> calcolo dei punti dei piloti e delle scuderie

python manange.py associate_circuit_images -> importa e associa le immagini dei circuiti

python manage.py export_data ->  Esporta i dati in JSON 
```
##### Avvio Server Backend
```
python manage.py runserver
```

### API Principali

- Scuderie --> "http://127.0.0.1:8000/api/teams/",
- Piloti --> "http://127.0.0.1:8000/api/drivers/",
- Gare --> "http://127.0.0.1:8000/api/races/",
- Sessioni --> "http://127.0.0.1:8000/api/sessions/",
- Risultati --> "http://127.0.0.1:8000/api/results/",
- Prossima gara --> "http://127.0.0.1:8000/api/races/next/"


## Integrazioni Future 
**⚠️ Nota Importante:** Il file `docker-compose.yml` **non è stato implementato** al momento della consegna.
L'applicazione richiede l'avvio manuale del backend e frontend come descritto nella sezione Setup.
Verrà implementata in una seconda versione.

- Docker Compose : Per Containerizazione completa dell'applicazione 
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


**Versione:** demo 1.0
**Aggioranto:** Ottobre 2025
