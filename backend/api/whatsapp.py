import requests
from django.conf import settings

GRAPH_URL = 'https://graph.facebook.com/v25.0'


def send_whatsapp_message(to: str, message: str) -> dict:
    """Send a free-form text message (only works within 24hr customer service window)."""
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'text',
        'text': {'body': message}
    }
    res = requests.post(url, json=payload, headers=_headers())
    return res.json()


def send_whatsapp_template(to: str, template_name: str, lang: str = 'en_US', components: list = None) -> dict:
    """Send a pre-approved template message (works anytime)."""
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'template',
        'template': {
            'name': template_name,
            'language': {'code': lang},
            'components': components or []
        }
    }
    res = requests.post(url, json=payload, headers=_headers())
    return res.json()


def send_bulk_messages(phone_numbers: list, message: str) -> list:
    """Send a message to multiple numbers."""
    results = []
    for phone in phone_numbers:
        result = send_whatsapp_message(phone, message)
        results.append({'phone': phone, 'result': result})
    return results


def _headers() -> dict:
    return {
        'Authorization': f'Bearer {settings.WHATSAPP_TOKEN}',
        'Content-Type': 'application/json'
    }
