f = open('views.py', 'r', encoding='utf-8')
lines = f.readlines()
f.close()

result = open('lines_out.txt', 'w', encoding='utf-8')
for i, l in enumerate(lines):
    result.write(f"{i}: {l}")
result.close()
