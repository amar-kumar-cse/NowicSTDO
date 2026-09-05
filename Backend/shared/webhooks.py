import logging
import os
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

def send_discord_webhook(content: str = None, embeds: list = None):
    url = getattr(settings, 'DISCORD_WEBHOOK_URL', os.environ.get('DISCORD_WEBHOOK_URL'))
    if not url:
        return
    
    payload = {}
    if content:
        payload['content'] = content
    if embeds:
        payload['embeds'] = embeds
        
    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
    except Exception as e:
        logger.error("Failed to send Discord webhook: %s", e)

def send_slack_webhook(text: str, blocks: list = None):
    url = getattr(settings, 'SLACK_WEBHOOK_URL', os.environ.get('SLACK_WEBHOOK_URL'))
    if not url:
        return
        
    payload = {'text': text}
    if blocks:
        payload['blocks'] = blocks
        
    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
    except Exception as e:
        logger.error("Failed to send Slack webhook: %s", e)

def notify_inbound_lead(name: str, email: str, project_type: str, message: str, phone: str = '', budget: str = ''):
    # Send Discord notification
    embed = {
        "title": "🔥 New Inbound Lead",
        "description": "A potential client has submitted the contact form.",
        "color": 3463578, # Mint green color (#34D99A equivalent: decimal 3463578)
        "fields": [
            {"name": "👤 Name", "value": name, "inline": True},
            {"name": "📧 Email", "value": email, "inline": True},
            {"name": "📞 Phone", "value": phone or "Not provided", "inline": True},
            {"name": "💻 Project Type", "value": project_type or "General", "inline": True},
            {"name": "💰 Budget", "value": budget or "Not provided", "inline": True},
            {"name": "📝 Message", "value": message, "inline": False}
        ]
    }
    send_discord_webhook(embeds=[embed])

    # Send Slack notification
    slack_blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "🔥 New Inbound Lead Created",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Name:*\n{name}"},
                {"type": "mrkdwn", "text": f"*Email:*\n{email}"},
                {"type": "mrkdwn", "text": f"*Phone:*\n{phone or 'N/A'}"},
                {"type": "mrkdwn", "text": f"*Project Type:*\n{project_type or 'General'}"},
                {"type": "mrkdwn", "text": f"*Budget:*\n{budget or 'N/A'}"}
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Message:*\n{message}"
            }
        }
    ]
    send_slack_webhook(text=f"New Lead: {name} ({email}) - {project_type}", blocks=slack_blocks)

def notify_new_booking(name: str, email: str, service_name: str, date: str, time_slot: str, phone: str = ''):
    # Send Discord notification
    embed = {
        "title": "📅 New Call Booking Confirmed",
        "description": "A new strategy/consultation call has been scheduled.",
        "color": 3463578,
        "fields": [
            {"name": "👤 Name", "value": name, "inline": True},
            {"name": "📧 Email", "value": email, "inline": True},
            {"name": "📞 Phone", "value": phone or "Not provided", "inline": True},
            {"name": "🛠️ Service", "value": service_name, "inline": True},
            {"name": "📆 Date", "value": date, "inline": True},
            {"name": "⏰ Time Slot", "value": time_slot, "inline": True}
        ]
    }
    send_discord_webhook(embeds=[embed])

    # Send Slack notification
    slack_blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "📅 New Appointment Booked",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {"type": "mrkdwn", "text": f"*Client:*\n{name}"},
                {"type": "mrkdwn", "text": f"*Email:*\n{email}"},
                {"type": "mrkdwn", "text": f"*Service:*\n{service_name}"},
                {"type": "mrkdwn", "text": f"*Scheduled:*\n{date} @ {time_slot}"}
            ]
        }
    ]
    send_slack_webhook(text=f"New Booking: {name} - {service_name} on {date}", blocks=slack_blocks)
