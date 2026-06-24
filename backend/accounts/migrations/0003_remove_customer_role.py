from django.db import migrations, models


def clear_customer_role(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    CustomUser.objects.filter(role='customer').update(role=None)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_customuser_required_full_name'),
    ]

    operations = [
        migrations.RunPython(clear_customer_role, migrations.RunPython.noop),
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
                ],
                max_length=20,
                null=True,
            ),
        ),
    ]
