f = open('views.py', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

# Find the line numbers
for i, l in enumerate(lines):
    if 'selected_id in' in l and 'bangalore' in l:
        start = i
    if 'category_map' in l and 'blr_degree' not in l:
        end = i
        break

new_section = """                        if selected_id in ['bangalore', 'mangalore', 'kerala']:
                            contact, _ = Contact.objects.get_or_create(
                                phone=phone,
                                defaults={'name': phone, 'source': 'WhatsApp'}
                            )

                            # 1. Send ENLIGHTED intro text
                            _send_wa_message(phone, 'Welcome to *ENLIGHTED Education!*\\n\\nWe help students find the best colleges across India. Here are our top college lists for you:')

                            # 2. Send Bangalore interactive list
                            _send_wa_interactive_list(
                                phone,
                                'BANGALORE Colleges',
                                'View Bangalore List',
                                [{
                                    'title': 'Top Colleges',
                                    'rows': [
                                        {'id': 'blr_c1', 'title': 'PES University'},
                                        {'id': 'blr_c2', 'title': 'Christ University'},
                                        {'id': 'blr_c3', 'title': 'Alliance University'},
                                        {'id': 'blr_c4', 'title': 'Presidency University'},
                                        {'id': 'blr_c5', 'title': 'REVA University'},
                                        {'id': 'blr_c6', 'title': 'BGS & SJB Group'},
                                        {'id': 'blr_c7', 'title': 'Sapthagiri University'},
                                    ]
                                },
                                {
                                    'title': 'More Colleges',
                                    'rows': [
                                        {'id': 'blr_degree', 'title': 'More Degree Colleges'},
                                        {'id': 'blr_medical', 'title': 'More Medical Colleges'},
                                        {'id': 'blr_engineering', 'title': 'More Engineering'},
                                    ]
                                }]
                            )

                            # 3. Send Mangalore interactive list
                            _send_wa_interactive_list(
                                phone,
                                'MANGALORE Colleges',
                                'View Mangalore List',
                                [{
                                    'title': 'Top Colleges',
                                    'rows': [
                                        {'id': 'mlr_c1', 'title': 'Yenepoya University'},
                                        {'id': 'mlr_c2', 'title': 'Srinivas University'},
                                        {'id': 'mlr_c3', 'title': 'Indiana Medical College'},
                                        {'id': 'mlr_c4', 'title': 'AJ College Engineering'},
                                        {'id': 'mlr_c5', 'title': 'Aliyah Nursing College'},
                                        {'id': 'mlr_c6', 'title': 'Unity Medical College'},
                                        {'id': 'mlr_c7', 'title': 'Sridevi College'},
                                    ]
                                },
                                {
                                    'title': 'More Colleges',
                                    'rows': [
                                        {'id': 'mlr_degree', 'title': 'More Degree Colleges'},
                                        {'id': 'mlr_medical', 'title': 'More Medical Colleges'},
                                        {'id': 'mlr_engineering', 'title': 'More Engineering'},
                                    ]
                                }]
                            )

                            # 4. Send Kerala text list
                            _send_wa_message(phone, COLLEGE_LISTS.get('Kerala'))

                            Message.objects.create(
                                contact_id=str(contact.id),
                                content='College lists sent',
                                direction='outbound',
                                status='sent',
                                is_automated=True,
                            )
                            contact.message_count += 1
                            contact.last_contacted_at = tz.now()
                            contact.save()
                            continue

"""

new_lines = lines[:start] + [new_section] + lines[end:]

f = open('views.py', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('Done, start:', start, 'end:', end)
