from pathlib import Path
text = Path('src/composants/Portfolio.jsx').read_text(encoding='utf-8')
start = text.index('<section id="pf-methodology"')
end = text.index('<section id="pf-contact"')
part = text[start:end]
print('segment length', len(part))
print('count <div', part.count('<div'))
print('count </div>', part.count('</div>'))
print('count selfclosing', part.count('/>'))
# print fragment around the end
lines = part.splitlines()
for i, line in enumerate(lines[-40:], start=len(lines)-39):
    print(f'{i}: {line}')
