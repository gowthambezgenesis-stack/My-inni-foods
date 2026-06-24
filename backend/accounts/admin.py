from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    ordering = ['email']
    list_display = ['email', 'full_name', 'role', 'phone', 'is_active', 'is_profile_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_profile_active', 'is_staff']
    search_fields = ['email', 'full_name', 'username', 'phone']

    fieldsets = (
        (None, {'fields': ('email',)}),
        ('Personal info', {'fields': ('username', 'full_name', 'phone', 'first_name', 'last_name')}),
        (
            'Role & access',
            {'fields': ('role', 'is_profile_active', 'admin_notes', 'last_login_ip')},
        ),
        (
            'Permissions',
            {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')},
        ),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('email', 'full_name'),
            },
        ),
        (
            'Optional',
            {
                'classes': ('wide', 'collapse'),
                'fields': ('phone', 'role', 'is_active', 'is_profile_active'),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.set_unusable_password()
        super().save_model(request, obj, form, change)
