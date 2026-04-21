from django.core.management.base import BaseCommand
from apps.users.models import UserProfile

class Command(BaseCommand):
    help = 'Promotes a given user to admin role'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to promote')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        try:
            profile = UserProfile.objects.get(email=email)
            profile.role = 'admin'
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated {email} to admin.'))
        except UserProfile.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {email} does not exist.'))
