import factory
from faker import Faker
from datetime import date, timedelta
from django.utils.text import slugify

from apps.users.models import UserProfile
from apps.crm.models import Lead
from apps.public.models import ServiceOffering
from apps.booking.models import BookingService, Appointment

faker = Faker()

class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta: 
        model = UserProfile
    clerk_user_id = factory.LazyFunction(lambda: f"user_{faker.uuid4()}")
    email = factory.Faker('email')
    full_name = factory.Faker('name')
    role = 'client'

class AdminUserFactory(UserProfileFactory):
    role = 'admin'

class LeadFactory(factory.django.DjangoModelFactory):
    class Meta: 
        model = Lead
    company_name = factory.Faker('company')
    founder_name = factory.Faker('name')
    email = factory.Faker('email')
    source = 'inbound'
    status = 'sent'

class ServiceOfferingFactory(factory.django.DjangoModelFactory):
    class Meta: 
        model = ServiceOffering
    name = factory.Faker('bs')
    slug = factory.LazyAttribute(lambda o: slugify(o.name))
    tagline = factory.Faker('catch_phrase')
    description = factory.Faker('paragraph')
    features = ['Feature 1', 'Feature 2']
    icon_name = 'Code'
    is_active = True
    order = factory.Sequence(lambda n: n)

class BookingServiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BookingService
    name = factory.Faker('bs')
    slug = factory.LazyAttribute(lambda o: slugify(o.name))
    price = factory.Faker('pyint', min_value=100, max_value=1000)
    duration_minutes = 60
    description = factory.Faker('paragraph')
    is_active = True

class AppointmentFactory(factory.django.DjangoModelFactory):
    class Meta: 
        model = Appointment
    clerk_user_id = factory.LazyFunction(lambda: f"user_{faker.uuid4()}")
    service = factory.SubFactory(BookingServiceFactory)
    date = factory.LazyFunction(lambda: date.today() + timedelta(days=1))
    time_slot = '10:00'
    status = 'pending'
