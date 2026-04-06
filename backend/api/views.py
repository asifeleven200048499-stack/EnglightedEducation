import uuid
from datetime import datetime, timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .db import get_db


def serialize(doc):
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id', doc.get('id', '')))
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


def now():
    return datetime.now(timezone.utc)


# ─── CONTACTS ────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def contacts_list(request):
    db = get_db()
    if request.method == 'GET':
        contacts = list(db.contacts.find())
        return JsonResponse([serialize(c) for c in contacts], safe=False)

    data = json.loads(request.body)
    contact = {
        '_id': str(uuid.uuid4()),
        'name': data.get('name', 'Unknown'),
        'phone': data.get('phone', ''),
        'email': data.get('email', ''),
        'course': data.get('course', ''),
        'school': data.get('school', ''),
        'source': data.get('source', 'Manual Entry'),
        'status': data.get('status', 'new'),
        'tags': data.get('tags', []),
        'leadScore': data.get('leadScore', 50),
        'intent': data.get('intent', 'neutral'),
        'messageCount': 0,
        'replyCount': 0,
        'hasOptedIn': False,
        'notes': [],
        'customFields': {},
        'createdAt': now(),
        'updatedAt': now(),
    }
    db.contacts.insert_one(contact)
    return JsonResponse(serialize(contact), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def contact_detail(request, contact_id):
    db = get_db()
    if request.method == 'GET':
        contact = db.contacts.find_one({'_id': contact_id})
        if not contact:
            return JsonResponse({'error': 'Not found'}, status=404)
        return JsonResponse(serialize(contact))

    if request.method == 'PUT':
        data = json.loads(request.body)
        data['updatedAt'] = now()
        data.pop('id', None)
        db.contacts.update_one({'_id': contact_id}, {'$set': data})
        contact = db.contacts.find_one({'_id': contact_id})
        return JsonResponse(serialize(contact))

    db.contacts.delete_one({'_id': contact_id})
    return JsonResponse({'success': True})


# ─── CAMPAIGNS ───────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def campaigns_list(request):
    db = get_db()
    if request.method == 'GET':
        return JsonResponse([serialize(c) for c in db.campaigns.find()], safe=False)

    data = json.loads(request.body)
    campaign = {
        '_id': str(uuid.uuid4()),
        'name': data.get('name', 'Untitled Campaign'),
        'description': data.get('description', ''),
        'messageTemplate': data.get('messageTemplate', ''),
        'targetTags': data.get('targetTags', []),
        'targetSegments': data.get('targetSegments', []),
        'status': data.get('status', 'draft'),
        'totalRecipients': 0,
        'sentCount': 0,
        'deliveredCount': 0,
        'readCount': 0,
        'repliedCount': 0,
        'failedCount': 0,
        'abTestEnabled': data.get('abTestEnabled', False),
        'createdBy': data.get('createdBy', 'Admin'),
        'createdAt': now(),
    }
    db.campaigns.insert_one(campaign)
    return JsonResponse(serialize(campaign), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def campaign_detail(request, campaign_id):
    db = get_db()
    if request.method == 'GET':
        doc = db.campaigns.find_one({'_id': campaign_id})
        return JsonResponse(serialize(doc)) if doc else JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        data = json.loads(request.body)
        data.pop('id', None)
        db.campaigns.update_one({'_id': campaign_id}, {'$set': data})
        return JsonResponse(serialize(db.campaigns.find_one({'_id': campaign_id})))

    db.campaigns.delete_one({'_id': campaign_id})
    return JsonResponse({'success': True})


# ─── TASKS ───────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def tasks_list(request):
    db = get_db()
    if request.method == 'GET':
        return JsonResponse([serialize(t) for t in db.tasks.find()], safe=False)

    data = json.loads(request.body)
    task = {
        '_id': str(uuid.uuid4()),
        'title': data.get('title', 'Untitled Task'),
        'description': data.get('description', ''),
        'contactId': data.get('contactId', ''),
        'assignedTo': data.get('assignedTo', 'Admin'),
        'assignedBy': data.get('assignedBy', 'Admin'),
        'status': data.get('status', 'pending'),
        'priority': data.get('priority', 'medium'),
        'dueDate': data.get('dueDate', ''),
        'createdAt': now(),
        'updatedAt': now(),
    }
    db.tasks.insert_one(task)
    return JsonResponse(serialize(task), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def task_detail(request, task_id):
    db = get_db()
    if request.method == 'GET':
        doc = db.tasks.find_one({'_id': task_id})
        return JsonResponse(serialize(doc)) if doc else JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        data = json.loads(request.body)
        data['updatedAt'] = now()
        data.pop('id', None)
        db.tasks.update_one({'_id': task_id}, {'$set': data})
        return JsonResponse(serialize(db.tasks.find_one({'_id': task_id})))

    db.tasks.delete_one({'_id': task_id})
    return JsonResponse({'success': True})


# ─── AUTOMATIONS ─────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def automations_list(request):
    db = get_db()
    if request.method == 'GET':
        return JsonResponse([serialize(a) for a in db.automations.find()], safe=False)

    data = json.loads(request.body)
    automation = {
        '_id': str(uuid.uuid4()),
        'name': data.get('name', 'Untitled Automation'),
        'description': data.get('description', ''),
        'isActive': data.get('isActive', False),
        'trigger': data.get('trigger', {'type': 'new-contact', 'config': {}}),
        'actions': data.get('actions', []),
        'createdAt': now(),
        'updatedAt': now(),
    }
    db.automations.insert_one(automation)
    return JsonResponse(serialize(automation), status=201)


@csrf_exempt
@require_http_methods(['GET', 'PUT', 'DELETE'])
def automation_detail(request, automation_id):
    db = get_db()
    if request.method == 'GET':
        doc = db.automations.find_one({'_id': automation_id})
        return JsonResponse(serialize(doc)) if doc else JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        data = json.loads(request.body)
        data['updatedAt'] = now()
        data.pop('id', None)
        db.automations.update_one({'_id': automation_id}, {'$set': data})
        return JsonResponse(serialize(db.automations.find_one({'_id': automation_id})))

    db.automations.delete_one({'_id': automation_id})
    return JsonResponse({'success': True})


# ─── MESSAGES ────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['GET', 'POST'])
def messages_list(request, contact_id):
    db = get_db()
    if request.method == 'GET':
        msgs = list(db.messages.find({'contactId': contact_id}))
        return JsonResponse([serialize(m) for m in msgs], safe=False)

    data = json.loads(request.body)
    message = {
        '_id': str(uuid.uuid4()),
        'contactId': contact_id,
        'content': data.get('content', ''),
        'direction': data.get('direction', 'outbound'),
        'status': data.get('status', 'sent'),
        'isAutomated': data.get('isAutomated', False),
        'sentAt': now(),
    }
    db.messages.insert_one(message)

    # Update contact message count
    if message['direction'] == 'outbound':
        db.contacts.update_one({'_id': contact_id}, {
            '$inc': {'messageCount': 1},
            '$set': {'lastContactedAt': now(), 'updatedAt': now()}
        })
    else:
        db.contacts.update_one({'_id': contact_id}, {
            '$inc': {'replyCount': 1},
            '$set': {'lastReplyAt': now(), 'updatedAt': now()}
        })

    return JsonResponse(serialize(message), status=201)
