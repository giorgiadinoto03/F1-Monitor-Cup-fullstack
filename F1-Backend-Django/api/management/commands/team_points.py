from django.core.management.base import BaseCommand
from api.models import Team
from django.db.models import Sum

class Command(BaseCommand):
    help = "Ricalcola i punti dei team come somma dei punti dei piloti"

    def handle(self, *args, **kwargs):
        for team in Team.objects.all():  # 🔹 per ogni team nel DB
            # 🔸 Calcola la somma di tutti i punti dei driver collegati a quel team
            total = team.drivers.aggregate(total=Sum('points'))['total'] or 0

            # 🔸 Se i punti sono cambiati, aggiorna il campo 'points' del team
            if team.points != total:
                team.points = total
                team.save(update_fields=['points'])

            # 🔸 Mostra il risultato in console
            self.stdout.write(f"{team.team_name}: {total}")

        # 🔸 Messaggio finale
        self.stdout.write(self.style.SUCCESS("✅ Ricalcolo completato"))
