# Generated manually for max_length=1000 on cover_image
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public', '0012_blogpost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='cover_image',
            field=models.ImageField(blank=True, max_length=1000, null=True, upload_to='blog/'),
        ),
    ]
