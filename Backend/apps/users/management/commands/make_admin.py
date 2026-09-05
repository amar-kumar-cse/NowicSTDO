from django.core.management.base import BaseCommand
from apps.users.models import UserProfile

class Command(BaseCommand):
    help = 'Promotes a given user to admin role'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to promote')
        parser.add_argument('--clerk-id', type=str, default='', help='Clerk User ID (user_...)')

    def handle(self, *args, **kwargs):
        email = kwargs['email'].strip().lower()
        clerk_id = kwargs.get('clerk_id', '').strip()
        try:
            profile = UserProfile.objects.get(email__iexact=email)
            profile.role = 'admin'
            profile.is_active = True
            if clerk_id:
                profile.clerk_user_id = clerk_id
            profile.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated {email} to admin (Clerk ID: {profile.clerk_user_id}).'))
        except UserProfile.DoesNotExist:
            target_id = clerk_id or f'pending_admin_{email}'
            profile = UserProfile.objects.create(
                clerk_user_id=target_id,
                email=email,
                full_name=email.split('@')[0].replace('.', ' ').replace('_', ' ').title(),
                role='admin',
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'Created admin profile for {email} with ID {target_id}.'))
