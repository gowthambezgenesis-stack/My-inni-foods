from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_add_payment_method'),
    ]

    operations = [
        migrations.AlterField(
            model_name='orderitem',
            name='product_image',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
    ]
