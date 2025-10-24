from django.core.management.base import BaseCommand
from api.models import Team
from django.db.models import Sum

class Command(BaseCommand):
    help = "Ricalcola i punti dei team come somma dei punti dei piloti"

    def handle(self, *args, **kwargs):
        for team in Team.objects.all():
            total = team.drivers.aggregate(total=Sum('points'))['total'] or 0

            if team.points != total:
                team.points = total
                team.save(update_fields=['points'])

            self.stdout.write(f"{team.team_name}: {total}")

        self.stdout.write(self.style.SUCCESS("✅ Ricalcolo punti team completato"))
