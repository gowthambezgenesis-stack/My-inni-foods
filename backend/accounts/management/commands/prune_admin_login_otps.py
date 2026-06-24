from django.core.management.base import BaseCommand

from accounts.models import AdminLoginOtp


class Command(BaseCommand):
    help = 'Delete admin OTP login records older than 2 days.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=AdminLoginOtp.RETENTION_DAYS,
            help=f'Retention window in days (default: {AdminLoginOtp.RETENTION_DAYS}).',
        )

    def handle(self, *args, **options):
        days = options['days']
        deleted_count = AdminLoginOtp.prune_old_records(days=days)
        self.stdout.write(
            self.style.SUCCESS(
                f'Deleted {deleted_count} admin login OTP record(s) older than {days} day(s).',
            ),
        )
