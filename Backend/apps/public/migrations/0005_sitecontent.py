from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('public', '0004_contactsubmission_budget_contactsubmission_phone_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SiteContent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.SlugField(max_length=100, unique=True)),
                ('data', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['section'],
                'verbose_name': 'Site Content',
                'verbose_name_plural': 'Site Content',
            },
        ),
    ]