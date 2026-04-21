"""
shared/email.py

Transactional email helpers using Django's send_mail.
All calls use fail_silently=True to keep the API responsive,
and are routed through a safe wrapper validator.
"""
import logging
from smtplib import SMTPException
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

# ─── Shared dark-theme base style ────────────────────────────────────────────
_BASE_STYLE = """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  body { margin:0; padding:0; background:#0a0a0f; font-family:'Inter',sans-serif; color:#e2e8f0; }
  .wrapper { max-width:600px; margin:0 auto; background:#0f1117; border:1px solid #1e293b;
             border-radius:12px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
            padding:32px 40px; text-align:center; }
  .header h1 { margin:0; color:#fff; font-size:22px; font-weight:600; letter-spacing:-0.3px; }
  .header p { margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:14px; }
  .body { padding:40px; }
  .body h2 { font-size:18px; font-weight:600; color:#f1f5f9; margin:0 0 16px; }
  .body p { font-size:15px; line-height:1.7; color:#94a3b8; margin:0 0 20px; }
  .highlight { background:#1e293b; border-left:3px solid #6366f1; border-radius:0 8px 8px 0;
               padding:16px 20px; margin:24px 0; }
  .highlight p { margin:0; color:#cbd5e1; font-size:14px; }
  table.info-table { width:100%; border-collapse:collapse; margin:20px 0; }
  table.info-table td { padding:10px 14px; font-size:14px; border-bottom:1px solid #1e293b; }
  table.info-table td:first-child { color:#64748b; font-weight:500; width:35%; }
  table.info-table td:last-child { color:#e2e8f0; }
  .footer { background:#080b10; padding:24px 40px; text-align:center;
            border-top:1px solid #1e293b; }
  .footer p { margin:0; font-size:12px; color:#475569; }
  .badge { display:inline-block; background:#6366f1; color:#fff; border-radius:6px;
           font-size:11px; font-weight:600; padding:3px 10px; margin-bottom:12px; }
</style>
"""


def _html_wrap(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
{_BASE_STYLE}</head>
<body>
<div class="wrapper">
{content}
<div class="footer">
  <p>© 2024 Nowic Studio · <a href="https://nowicstudio.in" style="color:#6366f1;text-decoration:none;">nowicstudio.in</a></p>
</div>
</div>
</body>
</html>"""


def _send_safe(subject, body, to_email, html_body=None):
    """Wrapper to safely send emails and handle missing/invalid data."""
    if not to_email or '@' not in to_email:
        logger.warning(f"Invalid or missing email address: {to_email}")
        return
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_body,
          fail_silently=False,
        )
    except (SMTPException, ValueError, OSError) as e:
        logger.error(f"Failed to send email to {to_email}: {e}")


# ─── Contact emails ───────────────────────────────────────────────────────────

def send_contact_confirmation(name: str, email: str) -> None:
    """Send an acknowledgement email to the user who submitted the contact form."""
    subject = "Thanks for reaching out — Nowic Studio"
    body = _html_wrap(f"""
<div class="header">
  <h1>Nowic Studio</h1>
  <p>Software Agency · Product Studio</p>
</div>
<div class="body">
  <span class="badge">Message Received</span>
  <h2>Hi {name}, we got your message! 👋</h2>
  <p>Thanks for reaching out to <strong>Nowic Studio</strong>. 
     We've received your enquiry and our team will get back to you 
     <strong>within 24 hours</strong>.</p>
  <div class="highlight">
    <p>⏰ Typical response time: <strong>under 24 hours</strong><br>
       📧 Replies come from: <strong>hello@nowicstudio.in</strong></p>
  </div>
  <p>While you wait, feel free to check out our 
     <a href="https://nowicstudio.in/portfolio" style="color:#6366f1;">portfolio</a> 
     or <a href="https://nowicstudio.in/services" style="color:#6366f1;">services</a>.</p>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Hi {name}, we received your message and will reply within 24 hours.",
        to_email=email,
        html_body=body,
    )


def send_contact_notification(
    name: str, email: str, project_type: str, message: str
) -> None:
    """Notify the admin team of a new contact form submission."""
    subject = f"New Lead: {name} — {project_type}"
    body = _html_wrap(f"""
<div class="header">
  <h1>New Contact Submission</h1>
  <p>A potential client just reached out</p>
</div>
<div class="body">
  <span class="badge">Inbound Lead</span>
  <h2>New Enquiry from {name}</h2>
  <table class="info-table">
    <tr><td>Name</td><td>{name}</td></tr>
    <tr><td>Email</td><td><a href="mailto:{email}" style="color:#6366f1;">{email}</a></td></tr>
    <tr><td>Project Type</td><td>{project_type}</td></tr>
  </table>
  <div class="highlight">
    <p><strong>Message:</strong><br>{message}</p>
  </div>
  <p>This lead has been automatically added to the CRM.</p>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"New contact from {name} ({email}): {message}",
        to_email=settings.ADMIN_EMAIL,
        html_body=body,
    )


def send_contact_reply(email: str, reply_note: str) -> None:
    """Send a professional reply update for a contact inquiry."""
    subject = "Update on your inquiry — Nowic Studio"
    body = _html_wrap(f"""
<div class="header">
  <h1>Nowic Studio</h1>
  <p>Inquiry Update</p>
</div>
<div class="body">
  <span class="badge">Response Sent</span>
  <h2>We have an update on your inquiry</h2>
  <p>Thank you for your patience. Our team reviewed your request and shared a response below.</p>
  <div class="highlight">
    <p><strong>Our response:</strong><br>{reply_note or 'Our team has reviewed your inquiry and will follow up with next steps shortly.'}</p>
  </div>
  <p>If you have additional context, simply reply to this email and we will continue the conversation.</p>
</div>
""")

    _send_safe(
        subject=subject,
        body=reply_note or "We have reviewed your inquiry and will follow up with you shortly.",
        to_email=email,
        html_body=body,
    )


# ─── Booking emails ───────────────────────────────────────────────────────────

def send_booking_confirmation(
    email: str, service_name: str, date: str, time_slot: str
) -> None:
    """Send booking confirmation to the client."""
    subject = f"Booking Confirmed — {service_name}"
    body = _html_wrap(f"""
<div class="header">
  <h1>Booking Confirmed ✅</h1>
  <p>Your session is scheduled</p>
</div>
<div class="body">
  <span class="badge">Confirmed</span>
  <h2>Your booking is locked in!</h2>
  <p>We've confirmed your session with Nowic Studio. Here are your details:</p>
  <table class="info-table">
    <tr><td>Service</td><td>{service_name}</td></tr>
    <tr><td>Date</td><td>{date}</td></tr>
    <tr><td>Time</td><td>{time_slot}</td></tr>
  </table>
  <div class="highlight">
    <p>📅 Please add this to your calendar.<br>
       📧 Need to cancel? Reply to this email or visit your dashboard.</p>
  </div>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Your booking for {service_name} on {date} at {time_slot} is confirmed.",
        to_email=email,
        html_body=body,
    )


def send_booking_reminder(
    email: str, service_name: str, date: str, time_slot: str
) -> None:
    """Send a day-before reminder email to the client."""
    subject = "Reminder: Tomorrow's session — Nowic Studio"
    body = _html_wrap(f"""
<div class="header">
  <h1>See You Tomorrow 👋</h1>
  <p>Just a friendly reminder</p>
</div>
<div class="body">
  <span class="badge">Reminder</span>
  <h2>Your session is tomorrow</h2>
  <p>Don't forget — you have a session booked with Nowic Studio tomorrow.</p>
  <table class="info-table">
    <tr><td>Service</td><td>{service_name}</td></tr>
    <tr><td>Date</td><td>{date}</td></tr>
    <tr><td>Time</td><td>{time_slot}</td></tr>
  </table>
  <div class="highlight">
    <p>⏰ Please be ready 5 minutes before your scheduled time.</p>
  </div>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Reminder: Your session for {service_name} is tomorrow at {time_slot}.",
        to_email=email,
        html_body=body,
    )


def send_invoice_email(
    client_email,
    client_name,
    invoice_number,
    amount,
    due_date,
    project_name,
    notes='',
):
    subject = f"Invoice #{invoice_number} — Nowic Studio"
    html = _html_wrap(f"""
<div class="header">
  <h1>Nowic Studio Invoice</h1>
  <p>Thank you for building with us</p>
</div>
<div class="body">
  <span class="badge">Invoice</span>
  <h2>Invoice #{invoice_number}</h2>
  <table class="info-table">
    <tr><td>Client</td><td>{client_name}</td></tr>
    <tr><td>Project</td><td>{project_name}</td></tr>
    <tr><td>Issue Date</td><td>{settings.TIME_ZONE}</td></tr>
    <tr><td>Due Date</td><td>{due_date}</td></tr>
  </table>
  <div class="highlight">
    <p><strong>Amount Due:</strong><br><span style="font-size:24px;color:#fff;">{amount}</span></p>
  </div>
  <p><strong>Notes:</strong> {notes or 'N/A'}</p>
  <p>For payment questions, reply to this email and our team will help immediately.</p>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Invoice {invoice_number} for {project_name}. Amount due: {amount}. Due date: {due_date}",
        to_email=client_email,
        html_body=html,
    )


def send_invoice_overdue(client_email, client_name, invoice_number, amount, days_overdue):
    subject = f"Payment Overdue: Invoice #{invoice_number}"
    html = _html_wrap(f"""
<div class="header">
  <h1>Payment Reminder</h1>
  <p>Invoice #{invoice_number}</p>
</div>
<div class="body">
  <span class="badge">Overdue</span>
  <h2>Hi {client_name}, this invoice is overdue</h2>
  <p>Our records show invoice <strong>#{invoice_number}</strong> is overdue by <strong>{days_overdue} day(s)</strong>.</p>
  <div class="highlight">
    <p><strong>Outstanding Amount:</strong> {amount}</p>
  </div>
  <p>Please let us know if you need any billing support.</p>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Invoice #{invoice_number} is overdue by {days_overdue} day(s). Outstanding amount: {amount}",
        to_email=client_email,
        html_body=html,
    )


def send_project_update_email(client_email, client_name, project_name, progress, update_title, description):
    subject = f"Project Update: {project_name} — {progress}% Complete"
    html = _html_wrap(f"""
<div class="header">
  <h1>Project Update</h1>
  <p>{project_name}</p>
</div>
<div class="body">
  <span class="badge">Progress Update</span>
  <h2>{update_title}</h2>
  <p>{description}</p>
  <div style="background:#1e293b;border-radius:10px;padding:6px;">
    <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:12px;border-radius:8px;width:{max(0, min(100, progress))}%;"></div>
  </div>
  <p style="margin-top:10px;">Current completion: <strong>{progress}%</strong></p>
  <p>Thanks, {client_name}. We are making steady progress and will keep updates coming.</p>
</div>
""")
    _send_safe(
        subject=subject,
        body=f"Project update for {project_name}: {update_title}. Progress is {progress}%.",
        to_email=client_email,
        html_body=html,
    )


def send_bulk_lead_email(to_email, name, subject, body):
    personalized = (body or '').replace('{{name}}', name or 'there')
    html = _html_wrap(f"""
<div class="header">
  <h1>Nowic Studio</h1>
  <p>{subject}</p>
</div>
<div class="body">
  <div class="highlight">
    <p>{personalized}</p>
  </div>
</div>
""")
    _send_safe(
        subject=subject,
        body=personalized,
        to_email=to_email,
        html_body=html,
    )


def send_followup_needed_email(
    admin_email,
    company_name,
    founder_name,
    email,
    phone,
    days_since_update,
    notes,
):
    subject = f"Follow-up needed: {company_name}"
    html = _html_wrap(f"""
<div class="header">
  <h1>Follow-up Reminder</h1>
  <p>CRM action required</p>
</div>
<div class="body">
  <h2>{company_name}</h2>
  <table class="info-table">
    <tr><td>Founder</td><td>{founder_name}</td></tr>
    <tr><td>Email</td><td>{email}</td></tr>
    <tr><td>Phone</td><td>{phone or 'N/A'}</td></tr>
    <tr><td>Days since update</td><td>{days_since_update}</td></tr>
  </table>
  <p><strong>Link hint:</strong> Update status in CRM</p>
  <div class="highlight">
    <p><strong>Notes preview:</strong><br>{(notes or '')[:300]}</p>
  </div>
</div>
""")
    _send_safe(
        subject=subject,
        body=f'Follow-up needed for {company_name}. Last update {days_since_update} day(s) ago.',
        to_email=admin_email,
        html_body=html,
    )
