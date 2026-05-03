import django, os, re
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'enlighted.settings')
django.setup()
from api.models import Contact

fixed = 0
skipped = []

for contact in Contact.objects.all():
    raw = contact.phone.strip()
    digits = re.sub(r'[^\d]', '', raw)

    # Strip leading OCR artifacts: 21, 24, 1, 2, 4 before 91xxxxxxxxxx
    for prefix in ['21', '24', '1', '2', '4']:
        pattern = r'^' + prefix + r'91\d{10}$'
        if re.match(pattern, digits):
            digits = digits[len(prefix):]
            break

    # Extra digits after 91 (e.g. 9180891359132) — take last 10
    if re.match(r'^91\d{11,}$', digits):
        digits = '91' + digits[-10:]

    # Bare 10-digit Indian number (no country code)
    if re.match(r'^[6-9]\d{9}$', digits):
        digits = '91' + digits

    if re.match(r'^91\d{10}$', digits):
        new_phone = '+' + digits
        if new_phone != raw:
            contact.phone = new_phone
            contact.save(update_fields=['phone'])
            fixed += 1
    else:
        skipped.append(raw)

print(f'Fixed: {fixed}')
print(f'Skipped: {len(skipped)}')
for s in skipped[:30]:
    print(' ', repr(s))
