# api/management/commands/import_all_openf1.py
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Pipeline completa: importa GP, sessioni, risultati, calcola punti piloti e team"

    def add_arguments(self, parser):
        parser.add_argument(
            '--year', type=int, default=2025,
            help='Anno delle stagioni da importare (default 2025)'
        )
        parser.add_argument(
            '--export-drivers', action='store_true',
            help='Esporta i dati dei piloti in JSON dopo l\'import'
        )

    def handle(self, *args, **options):
        year = options['year']
        export_drivers = options['export_drivers']

        self.stdout.write(self.style.MIGRATE_HEADING(f"\n🚀 Inizio pipeline OpenF1 per l\'anno {year}\n"))

        # 1️⃣ Importa GP
        self.stdout.write("\n📥 Importazione Gran Premi...")
        call_command('import_openf1_races')

        # 2️⃣ Importa sessioni
        self.stdout.write("\n📥 Importazione Sessioni...")
        call_command('import_openf1_sessions')

        # 3️⃣ Importa risultati
        self.stdout.write("\n📥 Importazione Risultati...")
        call_command('import_openf1_results')

        # 4️⃣ Calcola punti piloti
        self.stdout.write("\n🏁 Calcolo punti piloti...")
        call_command('calculated_driver_points')

        # 5️⃣ Calcola punti team
        self.stdout.write("\n🏎️ Calcolo punti team...")
        call_command('team_points')

        # 6️⃣ Export opzionale piloti in JSON
        if export_drivers:
            self.stdout.write("\n💾 Export piloti JSON...")
            call_command('import_openf1_drivers', '--export')

        self.stdout.write(self.style.SUCCESS("\n✅ Pipeline OpenF1 completata con successo!\n"))
