f = open('views.py', 'rb')
raw = f.read()
f.close()

# Decode ignoring errors
content = raw.decode('utf-8', errors='replace')

lines = content.split('\n')
start = None
end = None
for i, l in enumerate(lines):
    if 'COLLEGE_LISTS = {' in l:
        start = i
    if start and i > start and l.strip() == '}':
        end = i + 1
        break

print(f'Found COLLEGE_LISTS: lines {start} to {end}')

new_section = """COLLEGE_LISTS = {
    'Bangalore_Degree': (
        "DEGREE COLLEGES - BANGALORE\\n\\n"
        "1. CHRIST COLLEGE\\n"
        "2. ALLIANCE COLLEGE\\n"
        "3. PRESIDENCY COLLEGE\\n"
        "4. REVA COLLEGE\\n"
        "5. BGS AND SJB COLLEGE\\n"
        "6. SAPTHAGIRI COLLEGE\\n"
        "7. EAST POINT COLLEGE\\n"
        "8. ACHARYA COLLEGE\\n"
        "9. KOSHYS GROUP OF INSTITUTION\\n"
        "10. YENEPOYA UNIVERSITY\\n"
        "11. HILLSIDE COLLEGE\\n"
        "12. BRINDAVAN COLLEGE\\n"
        "13. RR COLLEGE\\n"
        "14. ABBS COLLEGE\\n"
        "15. HKBK COLLEGE\\n"
        "16. SEA COLLEGE\\n"
        "17. PADMASHREE COLLEGE\\n\\n"
        "Contact us for admissions!"
    ),
    'Bangalore_Engineering': (
        "ENGINEERING COLLEGES - BANGALORE\\n\\n"
        "1. ALLIANCE COLLEGE\\n"
        "2. PRESIDENCY COLLEGE\\n"
        "3. REVA COLLEGE\\n"
        "4. BGS AND SJB COLLEGE\\n"
        "5. SAPTHAGIRI COLLEGE\\n"
        "6. EAST POINT COLLEGE\\n"
        "7. OXFORD COLLEGE\\n"
        "8. S-VYASA COLLEGE\\n"
        "9. ACHARYA COLLEGE\\n"
        "10. YENEPOYA UNIVERSITY\\n"
        "11. BRINDAVAN COLLEGE\\n"
        "12. RR COLLEGE\\n"
        "13. HKBK COLLEGE\\n"
        "14. SEA COLLEGE\\n\\n"
        "Contact us for admissions!"
    ),
    'Bangalore_Medical': (
        "MEDICAL COLLEGES - BANGALORE\\n\\n"
        "1. PES COLLEGE\\n"
        "2. CHRISTIAN COLLEGE\\n"
        "3. BGS AND SJB COLLEGE\\n"
        "4. EAST POINT COLLEGE\\n"
        "5. ACHARYA COLLEGE\\n"
        "6. YENEPOYA UNIVERSITY\\n"
        "7. HILLSIDE COLLEGE\\n"
        "8. RR COLLEGE\\n"
        "9. SEA COLLEGE\\n"
        "10. SRI SIDDHARTHA COLLEGE\\n"
        "11. PADMASHREE COLLEGE\\n"
        "12. JUPITER COLLEGE\\n"
        "13. SURYA COLLEGE\\n"
        "14. NALAPAD COLLEGE OF NURSING\\n"
        "15. ABHAYA COLLEGE\\n"
        "16. HEARTLAND COLLEGE\\n"
        "17. NAVANEETHAM COLLEGE\\n"
        "18. FLORENCE COLLEGE\\n"
        "19. SMT LAKSHMIDEVI COLLEGE\\n\\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Degree': (
        "DEGREE COLLEGES - MANGALORE\\n\\n"
        "1. YENEPOYA COLLEGE\\n"
        "2. SRINIVAS COLLEGE\\n"
        "3. SRIDEVI COLLEGE\\n"
        "4. ALOYSIUS COLLEGE\\n"
        "5. P.A COLLEGE\\n"
        "6. AGNES COLLEGE\\n\\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Engineering': (
        "ENGINEERING COLLEGES - MANGALORE\\n\\n"
        "1. SRINIVAS COLLEGE\\n"
        "2. YENEPOYA COLLEGE\\n"
        "3. AJ COLLEGE OF ENGINEERING\\n"
        "4. SREE DHEVI COLLEGE\\n"
        "5. P.A COLLEGE\\n\\n"
        "Contact us for admissions!"
    ),
    'Mangalore_Medical': (
        "MEDICAL COLLEGES - MANGALORE\\n\\n"
        "1. YENEPOYA COLLEGE\\n"
        "2. INDIANA MEDICAL COLLEGE\\n"
        "3. ALIYAH COLLEGE OF NURSING\\n"
        "4. UNITY MEDICAL COLLEGE\\n"
        "5. SRINIVAS COLLEGE\\n"
        "6. VIDYA COLLEGE OF NURSING\\n"
        "7. SAHAYADRI COLLEGE OF NURSING\\n"
        "8. PRAGATHY COLLEGE OF NURSING\\n"
        "9. CITY COLLEGE OF NURSING\\n"
        "10. ATHENA GROUP OF INSTITUTION\\n\\n"
        "Contact us for admissions!"
    ),
    'Kerala': (
        "KERALA COLLEGE LIST\\n\\n"
        "1. KMM (KOCHI)\\n"
        "2. AL AZHAR (IDUKKI)\\n"
        "3. METS (CALICUT)\\n"
        "4. MES (KOCHI)\\n"
        "5. ELIMS (THRISSUR)\\n"
        "6. JAIN (KOCHI)\\n"
        "7. INDIRA GANDHI (KOCHI)\\n"
        "8. YMBC (KOCHI)\\n"
        "9. CHINMAYA VISHWA (KOCHI)\\n"
        "10. JAI BHARATH (KOCHI)\\n\\n"
        "Contact us for admissions!"
    ),
}
"""

new_lines = lines[:start] + [new_section] + lines[end:]
new_content = '\n'.join(new_lines)

f = open('views.py', 'w', encoding='utf-8')
f.write(new_content)
f.close()
print('Done!')
