f = open('views.py', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

new_section = """                        if selected_id in ['bangalore', 'mangalore', 'kerala']:
                            contact, _ = Contact.objects.get_or_create(
                                phone=phone,
                                defaults={'name': phone, 'source': 'WhatsApp'}
                            )

                            if selected_id == 'bangalore':
                                _send_wa_message(phone, 'Welcome to ENLIGHTED Education!\\n\\nWe help students find the best colleges across India. Here is our Bangalore college list:')
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
                                content = 'Bangalore college list sent'

                            elif selected_id == 'mangalore':
                                _send_wa_message(phone, 'Welcome to ENLIGHTED Education!\\n\\nWe help students find the best colleges across India. Here is our Mangalore college list:')
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
                                content = 'Mangalore college list sent'

                            else:
                                _send_wa_message(phone, 'Welcome to ENLIGHTED Education!\\n\\nWe help students find the best colleges across India. Here is our Kerala college list:')
                                college_reply = COLLEGE_LISTS.get('Kerala')
                                _send_wa_message(phone, college_reply)
                                content = college_reply

                            Message.objects.create(
                                contact_id=str(contact.id),
                                content=content,
                                direction='outbound',
                                status='sent',
                                is_automated=True,
                            )
                            contact.message_count += 1
                            contact.last_contacted_at = tz.now()
                            contact.save()
                            continue

"""

# Replace lines 652 to 736 (0-indexed)
new_lines = lines[:652] + [new_section] + lines[737:]

f = open('views.py', 'w', encoding='utf-8')
f.writelines(new_lines)
f.close()
print('Done')
