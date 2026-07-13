import hashlib
import secrets

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    """Manager where email is the unique login identifier."""

    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address.')
        if not extra_fields.get('full_name'):
            raise ValueError('Users must have a full name.')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', CustomUser.Role.SUPER_ADMIN)
        extra_fields.setdefault('is_profile_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, **extra_fields)


class CustomUser(AbstractUser):
    """Custom user model — email login with role-based access."""

    class Role(models.TextChoices):
        SUPER_ADMIN = 'super_admin', 'Super Admin'
        ORDER_MANAGER = 'order_manager', 'Order Manager'
        SUPPORT_AGENT = 'support_agent', 'Support Agent'

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, null=True, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        null=True,
        blank=True,
    )
    admin_notes = models.TextField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    is_profile_active = models.BooleanField(
        null=True,
        blank=True,
        default=True,
        help_text='Deactivate to revoke admin access without deleting the user.',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        ordering = ['-date_joined']

    def __str__(self) -> str:
        return f'{self.email} ({self.role})'

    @property
    def is_super_admin(self) -> bool:
        return (
            self.role == self.Role.SUPER_ADMIN
            and self.is_profile_active is not False
        )

    @property
    def is_admin_staff(self) -> bool:
        return (
            self.role in {
                self.Role.SUPER_ADMIN,
                self.Role.ORDER_MANAGER,
                self.Role.SUPPORT_AGENT,
            }
            and self.is_profile_active is not False
        )

    @property
    def can_manage_orders(self) -> bool:
        return (
            self.role in {self.Role.SUPER_ADMIN, self.Role.ORDER_MANAGER}
            and self.is_profile_active is not False
        )

    @property
    def can_manage_users(self) -> bool:
        return self.role == self.Role.SUPER_ADMIN and self.is_profile_active is not False


class AdminLoginOtp(models.Model):
    """One-time login codes emailed to registered admin users."""

    MAX_ATTEMPTS = 5
    OTP_TTL_MINUTES = 5
    RETENTION_DAYS = 2

    email = models.EmailField(db_index=True)
    otp_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def hash_otp(cls, otp: str) -> str:
        return hashlib.sha256(otp.encode('utf-8')).hexdigest()

    @classmethod
    def generate_otp(cls) -> str:
        return f'{secrets.randbelow(1_000_000):06d}'

    @classmethod
    def prune_old_records(cls, *, days: int | None = None) -> int:
        """Delete OTP rows older than the retention window (default: 2 days)."""
        retention_days = cls.RETENTION_DAYS if days is None else days
        cutoff = timezone.now() - timezone.timedelta(days=retention_days)
        deleted_count, _ = cls.objects.filter(created_at__lt=cutoff).delete()
        return deleted_count

    @classmethod
    def create_for_email(cls, email: str) -> tuple['AdminLoginOtp', str]:
        cls.prune_old_records()
        cls.objects.filter(email=email, is_used=False).update(is_used=True)
        plain_otp = cls.generate_otp()
        record = cls.objects.create(
            email=email,
            otp_hash=cls.hash_otp(plain_otp),
            expires_at=timezone.now() + timezone.timedelta(minutes=cls.OTP_TTL_MINUTES),
        )
        return record, plain_otp

    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    def verify(self, otp: str) -> bool:
        if self.is_used or self.is_expired():
            return False
        if self.attempts >= self.MAX_ATTEMPTS:
            return False
        self.attempts += 1
        self.save(update_fields=['attempts'])
        if self.hash_otp(otp) != self.otp_hash:
            return False
        self.is_used = True
        self.save(update_fields=['is_used'])
        return True
