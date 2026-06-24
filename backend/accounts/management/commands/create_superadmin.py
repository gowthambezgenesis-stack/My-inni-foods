from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from accounts.models import CustomUser

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a Super Admin user for OTP-based admin login.'

    def add_arguments(self, parser):
        parser.add_argument('--email', required=True, help='Super Admin email address')
        parser.add_argument('--full-name', required=True, help='Display name')
        parser.add_argument('--phone', default='', help='Phone number')
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update role if user with this email already exists',
        )

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        full_name = options['full_name'].strip()
        phone = options['phone'].strip() or None
        update = options['update']

        existing = User.objects.filter(email__iexact=email).first()
        if existing:
            if not update:
                raise CommandError(
                    f'User with email {email} already exists. Use --update to promote.'
                )
            existing.role = CustomUser.Role.SUPER_ADMIN
            existing.is_profile_active = True
            existing.is_active = True
            existing.is_staff = True
            existing.is_superuser = True
            existing.full_name = full_name
            if phone:
                existing.phone = phone
            existing.save()
            self.stdout.write(self.style.SUCCESS(f'Updated Super Admin: {email}'))
            return

        User.objects.create_superuser(
            email=email,
            full_name=full_name,
            phone=phone,
        )
        self.stdout.write(self.style.SUCCESS(f'Created Super Admin: {email}'))
