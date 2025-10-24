# api/management/commands/calculated_driver_points.py - VERSIONE CORRETTA
from django.core.management.base import BaseCommand
from api.models import Result, Driver, Session, Team
from django.db.models import Q, Sum

class Command(BaseCommand):
    help = "Calcola i punti piloti e team secondo il regolamento FIA reale (2025)"

    # Punteggi ufficiali F1 2025
    RACE_POINTS = {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    }

    SPRINT_POINTS = {
        1: 8, 2: 7, 3: 6, 4: 5, 5: 4,
        6: 3, 7: 2, 8: 1
    }

    def handle(self, *args, **kwargs):
        # 🔄 Reset punti piloti
        Driver.objects.all().update(points=0)
        self.stdout.write("🔄 Reset punti driver completato")

        # 🔥 CORREZIONE: Filtro sessioni più inclusivo
        valid_sessions = Session.objects.filter(
            Q(session_type__iexact="Race") |
            Q(session_type__iexact="Sprint") |
            Q(session_type__iexact="SPRINT_RACE") |
            Q(session_name__icontains="Race") & ~Q(session_name__icontains="Qualifying")
        ).select_related("race")

        self.stdout.write(f"🏁 Sessioni trovate per il calcolo punti: {valid_sessions.count()}")

        driver_points = {d.id: 0 for d in Driver.objects.all()}

        for session in valid_sessions:
            session_name = session.session_type.lower()
            session_display_name = session.session_name or session.session_type
            
            # 🔥 CORREZIONE: Determina meglio se è una sprint
            is_sprint_race = any(keyword in session_display_name.lower() 
                               for keyword in ['sprint', 'sprint race']) and "qualifying" not in session_display_name.lower()

            # Determina tabella punti
            points_table = self.SPRINT_POINTS if is_sprint_race else self.RACE_POINTS

            self.stdout.write(f"\n🏁 {session.race.meeting_name} - {session_display_name} {'(SPRINT)' if is_sprint_race else '(RACE)'}")

            # 🔥 CORREZIONE: Query risultati migliorata
            results = (
                Result.objects.filter(session=session)
                .exclude(
                    Q(dnf=True) | Q(dns=True) | Q(dsq=True) | 
                    Q(position__isnull=True)
                )
                .select_related("driver")
                .order_by("position")
            )

            if not results.exists():
                self.stdout.write(f"  ⚠️ Nessun risultato valido per questa sessione")
                continue

            # Assegna punti ai piloti secondo posizione
            for result in results:
                pos = result.position
                
                # 🔥 CORREZIONE: Controlla che la posizione sia valida per i punti
                if pos and pos in points_table:
                    driver_points[result.driver.id] += points_table[pos]
                    self.stdout.write(f"  ✅ P{pos}: {result.driver.full_name} +{points_table[pos]} pts")

            # 🔥 CORREZIONE: Giro più veloce - solo per gare principali (non sprint)
            if not is_sprint_race:
                self.assign_fastest_lap_point(session, driver_points)

        # Aggiorna punti piloti in batch (più efficiente)
        for driver_id, pts in driver_points.items():
            Driver.objects.filter(id=driver_id).update(points=pts)

        # Calcola e mostra classifica piloti
        self.show_driver_standings()
        
        # 🔥 CORREZIONE: Ricalcola punti team
        self.calculate_team_points()

        self.stdout.write(self.style.SUCCESS("\n✅ Calcolo punti piloti e team completato con successo!"))

    def assign_fastest_lap_point(self, session, driver_points):
        """Assegna 1 punto per il giro più veloce ai primi 10 classificati"""
        try:
            # Trova il miglior tempo tra i primi 10 classificati
            fastest_result = (
                Result.objects.filter(
                    session=session,
                    position__lte=10,  # Solo primi 10
                    best_lap_time__isnull=False,
                    dnf=False, dns=False, dsq=False
                )
                .exclude(best_lap_time="")
                .order_by("best_lap_time")
                .first()
            )
            
            if fastest_result:
                driver_points[fastest_result.driver.id] += 1
                self.stdout.write(f"  🟣 Fastest Lap: {fastest_result.driver.full_name} (+1 pt)")
                
        except Exception as e:
            self.stdout.write(f"  ⚠️ Errore nel calcolo fastest lap: {e}")

    def show_driver_standings(self):
        """Mostra la classifica piloti finale"""
        ranked_drivers = Driver.objects.all().order_by("-points")
        
        self.stdout.write("\n🏆 CLASSIFICA PILOTI FINALE:")
        self.stdout.write("-" * 50)
        for i, driver in enumerate(ranked_drivers, 1):
            if driver.points > 0:
                self.stdout.write(f"{i:2d}. {driver.full_name:25} {driver.points:3d} pts")
        self.stdout.write("-" * 50)

    def calculate_team_points(self):
        """Ricalcola i punti team come somma dei punti piloti"""
        self.stdout.write("\n🏎️ Calcolo punti team...")
        
        for team in Team.objects.all():
            total_points = team.drivers.aggregate(total=Sum('points'))['total'] or 0
            
            if team.points != total_points:
                team.points = total_points
                team.save(update_fields=['points'])
                
            self.stdout.write(f"  {team.team_name:25} {total_points:3d} pts")