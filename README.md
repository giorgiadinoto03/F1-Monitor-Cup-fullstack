# F1 Monitor Cup 🏎️
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

