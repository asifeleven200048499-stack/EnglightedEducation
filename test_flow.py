import requests

TOKEN = "EAAVEr7P9x8UBRckAM6hSuUqIXUSwKeqRKOuSnVOLriVNgiZB4i6O66tW4PijAWBToGzR1BRq7rPA2l1vY3K6fVPPogj9pZAWJk0IzRn9bJpnKB2hLZBVAP0sS2ujiqWPZAjOgC5Bh55dOZCOXblEdowINZBcZAPoXK2ncRoo3VVjbeGvzvVfxZAfBy6tmScc1G9JxOmSEyTvQOldRT96bZB4ZBLxNCkOrtDhMff4KRu1PZCSUSfxKz1fLdMoYR8cIZCoMj2bnjDDO0379UVcz882gT0ZCWgysTwZDZD"
PHONE_ID = "1071712342695088"
NUMBERS = ["+918848201505", "+916282991405", "+96879369103", "+96893492005"]
URL = f"https://graph.facebook.com/v21.0/{PHONE_ID}/messages"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def send(payload):
    r = requests.post(URL, json=payload, headers=HEADERS)
    print(r.json())

for TO in NUMBERS:
    print(f"\nSending to {TO}...")

    # 1. ENLIGHTED text
    send({
        "messaging_product": "whatsapp",
        "to": TO,
        "type": "text",
        "text": {"body": "*ENLIGHTED*\nWhere futures get clarity.\nTop colleges. Verified admissions.\nNo confusion. No wrong choices.\nOnly the right path forward.\nBuilt for students who aim higher.\n\nWant admission without stress?\nWe handle everything.\nLimited seats. Fast process.\nReply *START* now."}
    })

    # 2. Bangalore interactive list
    send({
        "messaging_product": "whatsapp",
        "to": TO,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": "BANGALORE Colleges"},
            "action": {
                "button": "View Bangalore List",
                "sections": [
                    {
                        "title": "Top Colleges",
                        "rows": [
                            {"id": "blr_c1", "title": "PES University"},
                            {"id": "blr_c2", "title": "Christ University"},
                            {"id": "blr_c3", "title": "Alliance University"},
                            {"id": "blr_c4", "title": "Presidency University"},
                            {"id": "blr_c5", "title": "REVA University"},
                            {"id": "blr_c6", "title": "BGS & SJB Group"},
                            {"id": "blr_c7", "title": "Sapthagiri University"}
                        ]
                    },
                    {
                        "title": "More Colleges",
                        "rows": [
                            {"id": "blr_degree", "title": "More Degree Colleges"},
                            {"id": "blr_medical", "title": "More Medical Colleges"},
                            {"id": "blr_engineering", "title": "More Engineering"}
                        ]
                    }
                ]
            }
        }
    })

    # 3. Mangalore interactive list
    send({
        "messaging_product": "whatsapp",
        "to": TO,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": "MANGALORE Colleges"},
            "action": {
                "button": "View Mangalore List",
                "sections": [
                    {
                        "title": "Top Colleges",
                        "rows": [
                            {"id": "mlr_c1", "title": "Yenepoya University"},
                            {"id": "mlr_c2", "title": "Srinivas University"},
                            {"id": "mlr_c3", "title": "Indiana Medical College"},
                            {"id": "mlr_c4", "title": "AJ College Engineering"},
                            {"id": "mlr_c5", "title": "Aliyah Nursing College"},
                            {"id": "mlr_c6", "title": "Unity Medical College"},
                            {"id": "mlr_c7", "title": "Sridevi College"}
                        ]
                    },
                    {
                        "title": "More Colleges",
                        "rows": [
                            {"id": "mlr_degree", "title": "More Degree Colleges"},
                            {"id": "mlr_medical", "title": "More Medical Colleges"},
                            {"id": "mlr_engineering", "title": "More Engineering"}
                        ]
                    }
                ]
            }
        }
    })

    # 4. Kerala interactive list
    send({
        "messaging_product": "whatsapp",
        "to": TO,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "body": {"text": "KERALA Colleges"},
            "action": {
                "button": "View Kerala List",
                "sections": [
                    {
                        "title": "Top Colleges",
                        "rows": [
                            {"id": "krl_c1", "title": "KMM (Kochi)"},
                            {"id": "krl_c2", "title": "Al Azhar (Idukki)"},
                            {"id": "krl_c3", "title": "METS (Calicut)"},
                            {"id": "krl_c4", "title": "MES (Kochi)"},
                            {"id": "krl_c5", "title": "ELIMS (Thrissur)"},
                            {"id": "krl_c6", "title": "JAIN (Kochi)"},
                            {"id": "krl_c7", "title": "Indira Gandhi (Kochi)"},
                            {"id": "krl_c8", "title": "YMBC (Kochi)"},
                            {"id": "krl_c9", "title": "Chinmaya Vishwa (Kochi)"},
                            {"id": "krl_c10", "title": "Jai Bharath (Kochi)"}
                        ]
                    }
                ]
            }
        }
    })

    print(f"Done {TO}!")

print("\nAll numbers done!")
