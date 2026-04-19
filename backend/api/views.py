import json
from datetime import datetime
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone as tz
from django.conf import settings
import requests
from .models import Contact, Campaign, Automation, Task, Message, Caller


def serialize_contact(c):
    return {
        'id': str(c.id), 'name': c.name, 'phone': c.phone, 'email': c.email,
        'course': c.course, 'school': c.school, 'source': c.source,
        'status': c.status, 'tags': c.tags, 'leadScore': c.lead_score,
        'intent': c.intent, 'messageCount': c.message_count, 'replyCount': c.reply_count,
        'hasOptedIn': c.has_opted_in, 'optedInAt': c.opted_in_at.isoformat() if c.opted_in_at else None,
        'notes': c.notes, 'customFields': c.custom_fields,
        'createdAt': c.created_at.isoformat(), 'updatedAt': c.updated_at.isoformat(),
        'lastContactedAt': c.last_contacted_at.isoformat() if c.last_contacted_at else None,
        'lastReplyAt': c.last_reply_at.isoformat() if c.last_reply_at else None,
    }


def serialize_campaign(c):
    return {
        'id': str(c.id), 'name': c.name, 'description': c.description,
        'messageTemplate': c.message_template, 'mediaUrl': c.media_url,
        'targetTags': c.target_tags, 'targetSegments': c.target_segments,
        'targetContactIds': c.target_contact_ids, 'status': c.status,
        'scheduledAt': c.scheduled_at.isoformat() if c.scheduled_at else None,
        'startedAt': c.started_at.isoformat() if c.started_at else None,
        'completedAt': c.completed_at.isoformat() if c.completed_at else None,
        'totalRecipients': c.total_recipients, 'sentCount': c.sent_count,
        'deliveredCount': c.delivered_count, 'readCount': c.read_count,
        'repliedCount': c.replied_count, 'failedCount': c.failed_count,
        'abTestEnabled': c.ab_test_enabled, 'variantA': c.variant_a,
        'variantB': c.variant_b, 'createdBy': c.created_by,
        'createdAt': c.created_at.isoformat(),
    }


def serialize_automation(a):
    return {
        'id': str(a.id), 'name': a.name, 'description': a.description,
        'isActive': a.is_active, 'trigger': a.trigger, 'actions': a.actions,
        'createdAt': a.created_at.isoformat(), 'updatedAt': a.updated_at.isoformat(),
    }


def serialize_task(t):
    return {
        'id': str(t.id), 'title': t.title, 'description': t.description,
        'contactId': t.contact_id, 'assignedTo': t.assigned_to, 'assignedBy': t.assigned_by,
        'status': t.status, 'priority': t.priority, 'dueDate': t.due_date.isoformat(),
        'completedAt': t.completed_at.isoformat() if t.completed_at else None,
        'reminderAt': t.reminder_at.isoformat() if t.reminder_at else None,
        'createdAt': t.created_at.isoformat(), 'updatedAt': t.updated_at.isoformat(),
    }


def serialize_message(m):
    return {
        'id': str(m.id), 'contactId': m.contact_id, 'content': m.content,
        'direction': m.direction, 'status': m.status, 'sentAt': m.sent_at.isoformat(),
        'deliveredAt': m.delivered_at.isoformat() if m.delivered_at else None,
        'readAt': m.read_at.isoformat() if m.read_at else None,
        'mediaUrl': m.media_url, 'mediaType': m.media_type,
        'campaignId': m.campaign_id, 'isAutomated': m.is_automated,
    }


def serialize_caller(c):
    return {
        'id': str(c.id), 'name': c.name, 'username': c.username,
        'assignedSchools': c.assigned_schools, 'assignedCourses': c.assigned_courses,
        'isActive': c.is_active, 'createdAt': c.created_at.isoformat(),
    }


# ─── CONTACTS ────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def contacts_list(request):
    if request.method == 'GET':
        contacts = Contact.objects.all().order_by('-created_at')
        limit = request.GET.get('limit')
        if limit:
            contacts = contacts[:int(limit)]
        return JsonResponse([serialize_contact(c) for c in contacts], safe=False)

    data = json.loads(request.body)
    phone = data.get('phone', '').strip()
    if phone and Contact.objects.filter(phone=phone).exists():
        existing = Contact.objects.get(phone=phone)
        return JsonResponse({'error': 'duplicate', 'message': 'A contact with this number already exists.', 'existing': serialize_contact(existing)}, status=409)

    contact = Contact.objects.create(
        name=data.get('name', 'Unknown'), phone=phone,
        email=data.get('email', ''), course=data.get('course', ''),
        school=data.get('school', ''), source=data.get('source', 'Manual Entry'),
        status=data.get('status', 'new'), tags=data.get('tags', []),
        lead_score=data.get('leadScore', 50), intent=data.get('intent', 'neutral'),
        notes=data.get('notes', []), custom_fields=data.get('customFields', {}),
    )
    return JsonResponse(serialize_contact(contact), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def contact_detail(request, contact_id):
    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_contact(contact))

    if request.method == 'PUT':
        data = json.loads(request.body)
        field_map = {
            'name': 'name', 'phone': 'phone', 'email': 'email',
            'course': 'course', 'school': 'school', 'source': 'source',
            'status': 'status', 'tags': 'tags', 'leadScore': 'lead_score',
            'intent': 'intent', 'messageCount': 'message_count',
            'replyCount': 'reply_count', 'hasOptedIn': 'has_opted_in',
            'notes': 'notes', 'customFields': 'custom_fields',
        }
        for api_key, model_field in field_map.items():
            if api_key in data:
                setattr(contact, model_field, data[api_key])
        contact.save()
        return JsonResponse(serialize_contact(contact))

    contact.delete()
    return JsonResponse({'success': True})


# ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def campaigns_list(request):
    if request.method == 'GET':
        return JsonResponse([serialize_campaign(c) for c in Campaign.objects.all()], safe=False)

    data = json.loads(request.body)
    campaign = Campaign.objects.create(
        name=data.get('name', 'Untitled Campaign'), description=data.get('description', ''),
        message_template=data.get('messageTemplate', ''), target_tags=data.get('targetTags', []),
        target_segments=data.get('targetSegments', []), status=data.get('status', 'draft'),
        ab_test_enabled=data.get('abTestEnabled', False), variant_a=data.get('variantA', ''),
        variant_b=data.get('variantB', ''), created_by=data.get('createdBy', 'Admin'),
    )
    return JsonResponse(serialize_campaign(campaign), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def campaign_detail(request, campaign_id):
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_campaign(campaign))

    if request.method == 'PUT':
        data = json.loads(request.body)
        field_map = {
            'name': 'name', 'description': 'description', 'messageTemplate': 'message_template',
            'status': 'status', 'targetTags': 'target_tags', 'targetSegments': 'target_segments',
            'totalRecipients': 'total_recipients', 'sentCount': 'sent_count',
            'deliveredCount': 'delivered_count', 'readCount': 'read_count',
            'repliedCount': 'replied_count', 'failedCount': 'failed_count',
            'abTestEnabled': 'ab_test_enabled', 'variantA': 'variant_a', 'variantB': 'variant_b',
        }
        for api_key, model_field in field_map.items():
            if api_key in data:
                setattr(campaign, model_field, data[api_key])
        campaign.save()
        return JsonResponse(serialize_campaign(campaign))

    campaign.delete()
    return JsonResponse({'success': True})


# ─── AUTOMATIONS ─────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def automations_list(request):
    if request.method == 'GET':
        return JsonResponse([serialize_automation(a) for a in Automation.objects.all()], safe=False)

    data = json.loads(request.body)
    automation = Automation.objects.create(
        name=data.get('name', 'Untitled Automation'), description=data.get('description', ''),
        is_active=data.get('isActive', False),
        trigger=data.get('trigger', {'type': 'new-contact', 'config': {}}),
        actions=data.get('actions', []),
    )
    return JsonResponse(serialize_automation(automation), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def automation_detail(request, automation_id):
    try:
        automation = Automation.objects.get(id=automation_id)
    except Automation.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_automation(automation))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for api_key, model_field in [('name', 'name'), ('description', 'description'), ('isActive', 'is_active'), ('trigger', 'trigger'), ('actions', 'actions')]:
            if api_key in data:
                setattr(automation, model_field, data[api_key])
        automation.save()
        return JsonResponse(serialize_automation(automation))

    automation.delete()
    return JsonResponse({'success': True})


# ─── TASKS ───────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def tasks_list(request):
    if request.method == 'GET':
        return JsonResponse([serialize_task(t) for t in Task.objects.all()], safe=False)

    data = json.loads(request.body)
    due_date_raw = data.get('dueDate', '')
    try:
        due_date = datetime.fromisoformat(due_date_raw.replace('Z', '+00:00')) if due_date_raw else tz.now()
    except Exception:
        due_date = tz.now()

    task = Task.objects.create(
        title=data.get('title', 'Untitled Task'), description=data.get('description', ''),
        contact_id=data.get('contactId', ''), assigned_to=data.get('assignedTo', 'Admin'),
        assigned_by=data.get('assignedBy', 'Admin'), status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium'), due_date=due_date,
    )
    return JsonResponse(serialize_task(task), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def task_detail(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_task(task))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for api_key, model_field in [('title', 'title'), ('description', 'description'), ('status', 'status'), ('priority', 'priority'), ('assignedTo', 'assigned_to')]:
            if api_key in data:
                setattr(task, model_field, data[api_key])
        if 'dueDate' in data and data['dueDate']:
            try:
                task.due_date = datetime.fromisoformat(data['dueDate'].replace('Z', '+00:00'))
            except Exception:
                pass
        if data.get('status') == 'completed' and not task.completed_at:
            task.completed_at = tz.now()
        task.save()
        return JsonResponse(serialize_task(task))

    task.delete()
    return JsonResponse({'success': True})


# ─── MESSAGES ────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def messages_list(request, contact_id):
    if request.method == 'GET':
        msgs = Message.objects.filter(contact_id=contact_id)
        return JsonResponse([serialize_message(m) for m in msgs], safe=False)

    data = json.loads(request.body)
    message = Message.objects.create(
        contact_id=contact_id, content=data.get('content', ''),
        direction=data.get('direction', 'outbound'), status=data.get('status', 'sent'),
        is_automated=data.get('isAutomated', False), campaign_id=data.get('campaignId', ''),
    )
    try:
        contact = Contact.objects.get(id=contact_id)
        if message.direction == 'outbound':
            contact.message_count += 1
            contact.last_contacted_at = tz.now()
        else:
            contact.reply_count += 1
            contact.last_reply_at = tz.now()
        contact.save()
    except Contact.DoesNotExist:
        pass

    return JsonResponse(serialize_message(message), status=201)


# ─── UNIQUE SCHOOLS & COURSES ───────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET'])
def contact_options(request):
    schools = list(Contact.objects.exclude(school='').values_list('school', flat=True).distinct().order_by('school'))
    courses = list(Contact.objects.exclude(course='').values_list('course', flat=True).distinct().order_by('course'))
    return JsonResponse({'schools': schools, 'courses': courses})


# ─── CALLERS ─────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def callers_list(request):
    if request.method == 'GET':
        return JsonResponse([serialize_caller(c) for c in Caller.objects.all()], safe=False)

    data = json.loads(request.body)
    username = data.get('username', '').strip()
    if Caller.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already taken'}, status=409)

    caller = Caller.objects.create(
        name=data.get('name', ''),
        username=username,
        password=data.get('password', ''),
        assigned_schools=data.get('assignedSchools', []),
        assigned_courses=data.get('assignedCourses', []),
        is_active=data.get('isActive', True),
    )
    return JsonResponse(serialize_caller(caller), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def caller_detail(request, caller_id):
    try:
        caller = Caller.objects.get(id=caller_id)
    except Caller.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse(serialize_caller(caller))

    if request.method == 'PUT':
        data = json.loads(request.body)
        for api_key, model_field in [
            ('name', 'name'), ('username', 'username'), ('password', 'password'),
            ('assignedSchools', 'assigned_schools'), ('assignedCourses', 'assigned_courses'),
            ('isActive', 'is_active'),
        ]:
            if api_key in data:
                setattr(caller, model_field, data[api_key])
        caller.save()
        return JsonResponse(serialize_caller(caller))

    caller.delete()
    return JsonResponse({'success': True})


@csrf_exempt
@require_http_methods(['POST'])
def caller_login(request):
    data = json.loads(request.body)
    username = data.get('username', '').strip()
    password = data.get('password', '')
    try:
        caller = Caller.objects.get(username=username, password=password, is_active=True)
        return JsonResponse({'success': True, 'caller': serialize_caller(caller)})
    except Caller.DoesNotExist:
        return JsonResponse({'error': 'Invalid credentials or account disabled'}, status=401)


@csrf_exempt
@require_http_methods(['GET'])
def caller_contacts(request, caller_id):
    try:
        caller = Caller.objects.get(id=caller_id)
    except Caller.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    contacts = Contact.objects.all()
    if caller.assigned_schools:
        contacts = contacts.filter(school__in=caller.assigned_schools)
    if caller.assigned_courses:
        contacts = contacts.filter(course__in=caller.assigned_courses)

    return JsonResponse([serialize_contact(c) for c in contacts], safe=False)


# ─── WHATSAPP ────────────────────────────────────────────────────────────────

GRAPH_URL = 'https://graph.facebook.com/v25.0'


def _wa_headers():
    return {
        'Authorization': f'Bearer {settings.WHATSAPP_TOKEN.strip()}',
        'Content-Type': 'application/json',
    }


def _send_wa_message(to, text):
    # Ensure number has + prefix
    if not to.startswith('+'):
        to = '+' + to
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'text',
        'text': {'body': text},
    }
    res = requests.post(url, json=payload, headers=_wa_headers())
    return res.json()


def _send_wa_interactive_buttons(to, body_text, buttons):
    # Ensure number has + prefix
    if not to.startswith('+'):
        to = '+' + to
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'interactive',
        'interactive': {
            'type': 'button',
            'body': {'text': body_text},
            'action': {'buttons': buttons}
        }
    }
    res = requests.post(url, json=payload, headers=_wa_headers())
    return res.json()


COLLEGE_LISTS = {
    'Bangalore': '''🎓 *BANGALORE COLLEGE LIST*

1️⃣ SRI VINAYA GROUP | FLORENCE GROUP
2️⃣ SRI SIDDHARTHA COLLEGE | JUPITER GROUP
3️⃣ HILLSIDE GROUP | BGS AND SJB GROUP
4️⃣ EAST POINT GROUP | PADMASHREE GROUP
5️⃣ ABHAYA COLLEGE | NALAPAD NURSING
6️⃣ PES UNIVERSITY | S-VYASA COLLEGE
7️⃣ KOSHYS GROUP | MATHRUSHREE COLLEGE
8️⃣ BRINDAVAN GROUP | CHRIST UNIVERSITY
9️⃣ JAIN UNIVERSITY | REVA UNIVERSITY
🔟 PRESIDENCY UNIVERSITY | GARDEN CITY UNIVERSITY

📞 *Contact us for admissions!*
💬 Reply with course name for details''',
    'Manglore': '''🎓 *MANGALORE COLLEGE LIST*

1️⃣ SRINIVAS UNIVERSITY
2️⃣ YENEPOYA UNIVERSITY
3️⃣ INDIANA HOSPITAL AND HEART INSTITUTE
4️⃣ AJ COLLEGE OF ENGINEERING
5️⃣ TEJASWINI GROUP OF INSTITUTION
6️⃣ UNITY ACADEMY OF EDUCATION
7️⃣ K. PANDIRAJA BALLAL NURSING INSTITUTE
8️⃣ ALIYAH COLLEGE OF NURSING
9️⃣ NITTE INSTITUTE OF HOSPITALITY SERVICE
🔟 SHREE DEVI EDUCATION TRUST

📞 *Contact us for admissions!*
💬 Reply with course name for details''',
    'Mangalore': '''🎓 *MANGALORE COLLEGE LIST*

1️⃣ SRINIVAS UNIVERSITY
2️⃣ YENEPOYA UNIVERSITY
3️⃣ INDIANA HOSPITAL AND HEART INSTITUTE
4️⃣ AJ COLLEGE OF ENGINEERING
5️⃣ TEJASWINI GROUP OF INSTITUTION
6️⃣ UNITY ACADEMY OF EDUCATION
7️⃣ K. PANDIRAJA BALLAL NURSING INSTITUTE
8️⃣ ALIYAH COLLEGE OF NURSING
9️⃣ NITTE INSTITUTE OF HOSPITALITY SERVICE
🔟 SHREE DEVI EDUCATION TRUST

📞 *Contact us for admissions!*
💬 Reply with course name for details''',
    'Kerala': '''🎓 *KERALA COLLEGE LIST*

1️⃣ KMM (KOCHI)

2️⃣ AL AZHAR (IDUKKI)

3️⃣ METS (CALICUT)

4️⃣ MES (KOCHI)

5️⃣ ELIMS (THRISSUR)

6️⃣ JAIN (KOCHI)

7️⃣ INDIRA GANDHI

8️⃣ YMBC (KOCHI)

📞 *Contact us for admissions!*
💬 Reply with course name for details''',
}


@csrf_exempt
def whatsapp_webhook(request):
    if request.method == 'GET':
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        if mode == 'subscribe' and token == settings.WHATSAPP_VERIFY_TOKEN:
            return HttpResponse(challenge, content_type='text/plain')
        return HttpResponse('Forbidden', status=403)

    try:
        data = json.loads(request.body)
        for entry in data.get('entry', []):
            for change in entry.get('changes', []):
                for msg in change.get('value', {}).get('messages', []):
                    phone = msg.get('from', '')
                    
                    # Handle interactive messages (buttons and lists)
                    if msg.get('type') == 'interactive':
                        interactive = msg.get('interactive', {})
                        
                        # Handle button clicks
                        button_id = interactive.get('button_reply', {}).get('id', '')
                        
                        # Handle list selections
                        list_id = interactive.get('list_reply', {}).get('id', '')
                        
                        # Get the selected option (button or list)
                        selected_id = button_id or list_id
                        
                        if selected_id in ['bangalore', 'mangalore', 'kerala']:
                            city_name = selected_id.title()
                            college_reply = COLLEGE_LISTS.get(city_name)
                            if college_reply:
                                _send_wa_message(phone, college_reply)
                                contact, _ = Contact.objects.get_or_create(
                                    phone=phone,
                                    defaults={'name': phone, 'source': 'WhatsApp'}
                                )
                                Message.objects.create(
                                    contact_id=str(contact.id),
                                    content=college_reply,
                                    direction='outbound',
                                    status='sent',
                                    is_automated=True,
                                )
                                contact.message_count += 1
                                contact.last_contacted_at = tz.now()
                                contact.save()
                            continue
                    
                    # Handle text messages
                    text = msg.get('text', {}).get('body', '')
                    if not phone or not text:
                        continue
                    contact, _ = Contact.objects.get_or_create(
                        phone=phone,
                        defaults={'name': phone, 'source': 'WhatsApp'}
                    )
                    Message.objects.create(
                        contact_id=str(contact.id),
                        content=text,
                        direction='inbound',
                        status='read',
                        is_automated=False,
                    )
                    contact.reply_count += 1
                    contact.last_reply_at = tz.now()
                    contact.save()
                    # Auto-reply with college list if button tapped
                    college_reply = COLLEGE_LISTS.get(text.strip())
                    if college_reply:
                        _send_wa_message(phone, college_reply)
                        Message.objects.create(
                            contact_id=str(contact.id),
                            content=college_reply,
                            direction='outbound',
                            status='sent',
                            is_automated=True,
                        )
                        contact.message_count += 1
                        contact.last_contacted_at = tz.now()
                        contact.save()
    except Exception:
        pass

    return HttpResponse('OK', status=200)


@csrf_exempt
@require_http_methods(['POST'])
def whatsapp_send(request):
    data = json.loads(request.body)
    contact_id = data.get('contactId')
    message_text = data.get('message', '')
    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return JsonResponse({'error': 'Contact not found'}, status=404)

    phone = contact.phone
    if not phone.startswith('+'):
        phone = '+' + phone

    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': phone,
        'type': 'text',
        'text': {'body': message_text},
    }
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f'Sending WA message to {phone}, token starts: {settings.WHATSAPP_TOKEN[:20]}')
    
    res = requests.post(url, json=payload, headers=_wa_headers())
    result = res.json()
    logger.error(f'WA API response: {result}')

    if result.get('messages'):
        msg = Message.objects.create(
            contact_id=contact_id, content=message_text,
            direction='outbound', status='sent', is_automated=False,
        )
        contact.message_count += 1
        contact.last_contacted_at = tz.now()
        contact.save()
        return JsonResponse({'success': True, 'message': serialize_message(msg)})
    return JsonResponse({'error': result}, status=400)


@csrf_exempt
@require_http_methods(['GET'])
def whatsapp_templates(request):
    url = f'{GRAPH_URL}/{settings.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates'
    params = {'fields': 'name,status,category,language,components', 'limit': 100}
    res = requests.get(url, headers=_wa_headers(), params=params)
    return JsonResponse(res.json())


@csrf_exempt
@require_http_methods(['POST'])
def whatsapp_send_template(request):
    data = json.loads(request.body)
    contact_id = data.get('contactId')
    template_name = data.get('templateName', 'enlighted_admission_enquiry')
    lang = data.get('lang', 'en')
    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return JsonResponse({'error': 'Contact not found'}, status=404)

    phone = contact.phone
    if not phone.startswith('+'):
        phone = '+' + phone

    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': phone,
        'type': 'template',
        'template': {'name': template_name, 'language': {'code': lang}},
    }
    res = requests.post(url, json=payload, headers=_wa_headers())
    result = res.json()

    if result.get('messages'):
        msg = Message.objects.create(
            contact_id=contact_id,
            content=f'[Template: {template_name}]',
            direction='outbound', status='sent', is_automated=False,
        )
        contact.message_count += 1
        contact.last_contacted_at = tz.now()
        contact.save()
        return JsonResponse({'success': True, 'message': serialize_message(msg)})
    return JsonResponse({'error': result}, status=400)


@csrf_exempt
@require_http_methods(['POST'])
def whatsapp_bulk_send(request):
    data = json.loads(request.body)
    message_text = data.get('message', '')
    tag = data.get('tag')
    contact_ids = data.get('contactIds', [])

    if contact_ids:
        contacts = Contact.objects.filter(id__in=contact_ids)
    elif tag:
        contacts = Contact.objects.filter(tags__contains=[tag])
    else:
        contacts = Contact.objects.all()

    results = []
    for contact in contacts:
        result = _send_wa_message(contact.phone, message_text)
        if result.get('messages'):
            Message.objects.create(
                contact_id=str(contact.id), content=message_text,
                direction='outbound', status='sent', is_automated=True,
            )
            contact.message_count += 1
            contact.last_contacted_at = tz.now()
            contact.save()
        results.append({'phone': contact.phone, 'name': contact.name, 'success': bool(result.get('messages'))})

    return JsonResponse({'results': results, 'total': len(results)})
