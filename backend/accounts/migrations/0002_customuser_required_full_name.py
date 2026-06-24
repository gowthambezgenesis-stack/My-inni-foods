from django.db import migrations, models


def backfill_full_name(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    for user in CustomUser.objects.filter(full_name=''):
        user.full_name = user.email.split('@')[0]
        user.save(update_fields=['full_name'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(backfill_full_name, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customuser',
            name='full_name',
            field=models.CharField(max_length=150),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                blank=True,
                choices=[
                    ('super_admin', 'Super Admin'),
                    ('order_manager', 'Order Manager'),
                    ('support_agent', 'Support Agent'),
                    ('viewer', 'Viewer'),
                    ('customer', 'Customer'),
                ],
                default='customer',
                max_length=20,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='is_profile_active',
            field=models.BooleanField(
                blank=True,
                default=True,
                help_text='Deactivate to revoke admin access without deleting the user.',
                null=True,
            ),
        ),
    ]
