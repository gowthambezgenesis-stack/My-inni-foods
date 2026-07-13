from django.db import migrations, models


def migrate_viewer_to_support_agent(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    CustomUser.objects.filter(role='viewer').update(role='support_agent')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_remove_customer_role'),
    ]

    operations = [
        migrations.RunPython(migrate_viewer_to_support_agent, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customuser',
            name='role',
            field=models.CharField(
                blank=True,
                choices=[
                    ('super_admin', 'Super Admin'),
                    ('order_manager', 'Order Manager'),
                    ('support_agent', 'Support Agent'),
                ],
                max_length=20,
                null=True,
            ),
        ),
    ]
