from django.db import migrations, models


def migrate_shipped_to_shipping(apps, schema_editor):
    Order = apps.get_model('orders', 'Order')
    Order.objects.filter(status='shipped').update(status='shipping')


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(migrate_shipped_to_shipping, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('processing', 'Processing'),
                    ('shipping', 'Shipping'),
                    ('out_for_delivery', 'Out for Delivery'),
                    ('delivered', 'Delivered'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
