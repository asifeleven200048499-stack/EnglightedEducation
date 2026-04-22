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
        total = contacts.count()
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        contacts = contacts[offset:offset + limit]
        response = JsonResponse([serialize_contact(c) for c in contacts], safe=False)
        response['X-Total-Count'] = total
        response['Access-Control-Expose-Headers'] = 'X-Total-Count'
        return response

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


def _send_wa_interactive_list(to, body_text, button_text, sections):
    if not to.startswith('+'):
        to = '+' + to
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'interactive',
        'interactive': {
            'type': 'list',
            'body': {'text': body_text},
            'action': {
                'button': button_text,
                'sections': sections
            }
        }
    }
    res = requests.post(url, json=payload, headers=_wa_headers())
    return res.json()



COLLEGE_LISTS = {
    'Bangalore_Degree': (
        "DEGREE COLLEGES - BANGALORE\n\n"
        "1. CHRIST COLLEGE\n"
        "2. ALLIANCE COLLEGE\n"
        "3. PRESIDENCY COLLEGE\n"
        "4. REVA COLLEGE\n"
        "5. BGS AND SJB COLLEGE\n"
        "6. SAPTHAGIRI COLLEGE\n"
        "7. EAST POINT COLLEGE\n"
        "8. ACHARYA COLLEGE\n"
        "9. KOSHYS GROUP OF INSTITUTION\n"
        "10. YENEPOYA UNIVERSITY\n"
        "11. HILLSIDE COLLEGE\n"
        "12. BRINDAVAN COLLEGE\n"
        "13. RR COLLEGE\n"
        "14. ABBS COLLEGE\n"
        "15. HKBK COLLEGE\n"
        "16. SEA COLLEGE\n"
        "17. PADMASHREE COLLEGE\n\n"
        "Contact us for admissions!"
    ),
    'Bangalore_Engineering': (
        "ENGINEERING COLLEGES - BANGALORE\n\n"
        "1. ALLIANCE COLLEGE\n"
        "2. PRESIDENCY COLLEGE\n"
        "3. REVA COLLEGE\n"
        "4. BGS AND SJB COLLEGE\n"
        "5. SAPTHAGIRI COLLEGE\n"
        "6. EAST POINT COLLEGE\n"
        "7. OXFORD COLLEGE\n"
        "8. S-VYASA COLLEGE\n"
        "9. ACHARYA COLLEGE\n"
        "10. YENEPOYA UNIVERSITY\n"
        "11. BRINDAVAN COLLEGE\n"
        "12. RR COLLEGE\n"
        "13. HKBK COLLEGE\n"
        "14. SEA COLLEGE\n\n"
        "Contact us for admissions!"
    ),
    'Bangalore_Medical': (
        "MEDICAL COLLEGES - BANGALORE\n\n"
        "1. PES COLLEGE\n"
        "2. CHRISTIAN COLLEGE\n"
        "3. BGS AND SJB COLLEGE\n"
        "4. EAST POINT COLLEGE\n"
        "5. ACHARYA COLLEGE\n"
        "6. YENEPOYA UNIVERSITY\n"
        "7. HILLSIDE COLLEGE\n"
        "8. RR COLLEGE\n"
        "9. SEA COLLEGE\n"
        "10. SRI SIDDHARTHA COLLEGE\n"
        "11. PADMASHREE COLLEGE\n"
        "12. JUPITER COLLEGE\n"
        "13. SURYA COLLEGE\n"
        "14. NALAPAD COLLEGE OF NURSING\n"
        "15. ABHAYA COLLEGE\n"
        "16. HEARTLAND COLLEGE\n"
        "17. NAVANEETHAM COLLEGE\n"
        "18. FLORENCE COLLEGE\n"
        "19. SMT LAKSHMIDEVI COLLEGE\n\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Degree': (
        "DEGREE COLLEGES - MANGALORE\n\n"
        "1. YENEPOYA COLLEGE\n"
        "2. SRINIVAS COLLEGE\n"
        "3. SRIDEVI COLLEGE\n"
        "4. ALOYSIUS COLLEGE\n"
        "5. P.A COLLEGE\n"
        "6. AGNES COLLEGE\n\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Engineering': (
        "ENGINEERING COLLEGES - MANGALORE\n\n"
        "1. SRINIVAS COLLEGE\n"
        "2. YENEPOYA COLLEGE\n"
        "3. AJ COLLEGE OF ENGINEERING\n"
        "4. SREE DHEVI COLLEGE\n"
        "5. P.A COLLEGE\n\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Medical': (
        "MEDICAL COLLEGES - MANGALORE\n\n"
        "1. YENEPOYA COLLEGE\n"
        "2. INDIANA MEDICAL COLLEGE\n"
        "3. ALIYAH COLLEGE OF NURSING\n"
        "4. UNITY MEDICAL COLLEGE\n"
        "5. SRINIVAS COLLEGE\n"
        "6. VIDYA COLLEGE OF NURSING\n"
        "7. SAHAYADRI COLLEGE OF NURSING\n"
        "8. PRAGATHY COLLEGE OF NURSING\n"
        "9. CITY COLLEGE OF NURSING\n"
        "10. ATHENA GROUP OF INSTITUTION\n\n"
        "Contact us for admissions!"
    ),
    'Kerala': (
        "KERALA COLLEGE LIST\n\n"
        "1. KMM (KOCHI)\n"
        "2. AL AZHAR (IDUKKI)\n"
        "3. METS (CALICUT)\n"
        "4. MES (KOCHI)\n"
        "5. ELIMS (THRISSUR)\n"
        "6. JAIN (KOCHI)\n"
        "7. INDIRA GANDHI (KOCHI)\n"
        "8. YMBC (KOCHI)\n"
        "9. CHINMAYA VISHWA (KOCHI)\n"
        "10. JAI BHARATH (KOCHI)\n\n"
        "Contact us for admissions!"
    ),
}

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
        total = contacts.count()
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
        contacts = contacts[offset:offset + limit]
        response = JsonResponse([serialize_contact(c) for c in contacts], safe=False)
        response['X-Total-Count'] = total
        response['Access-Control-Expose-Headers'] = 'X-Total-Count'
        return response

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


def _send_wa_interactive_list(to, body_text, button_text, sections):
    if not to.startswith('+'):
        to = '+' + to
    url = f'{GRAPH_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages'
    payload = {
        'messaging_product': 'whatsapp',
        'to': to,
        'type': 'interactive',
        'interactive': {
            'type': 'list',
            'body': {'text': body_text},
            'action': {
                'button': button_text,
                'sections': sections
            }
        }
    }
    res = requests.post(url, json=payload, headers=_wa_headers())
    return res.json()


