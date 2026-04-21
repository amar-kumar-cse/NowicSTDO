from django.db.models import Q


def search_leads(query: str, queryset=None):
    if queryset is None:
        from apps.crm.models import Lead

        queryset = Lead.objects.filter(is_active=True)

    return queryset.filter(
        Q(company_name__icontains=query)
        | Q(founder_name__icontains=query)
        | Q(email__icontains=query)
        | Q(notes__icontains=query)
        | Q(phone__icontains=query)
    )


def search_portfolio(query: str):
    from apps.public.models import PortfolioProject

    return PortfolioProject.objects.filter(
        Q(title__icontains=query)
        | Q(description__icontains=query)
        | Q(tech_stack__icontains=query)
        | Q(category__icontains=query)
    )


def search_submissions(query: str):
    from apps.public.models import ContactSubmission

    return ContactSubmission.objects.filter(
        Q(name__icontains=query)
        | Q(email__icontains=query)
        | Q(message__icontains=query)
    )
