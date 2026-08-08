import pathlib
import re
root = pathlib.Path('6a6b6958e14b7.site123.me')
html = root.joinpath('index.html').read_text(encoding='utf-8')
urls = []
for m in re.finditer(r'(?:href|src|content)=("|\')(.*?)\1|srcset=("|\')(.*?)\3', html, re.S):
    if m.group(2):
        urls.append(m.group(2))
    if m.group(4):
        urls.extend(item.split()[0] for item in re.split(r',\s*', m.group(4)))
local = []
remote = []
missing = []
for url in urls:
    if not url or url.startswith(('data:', 'mailto:', 'tel:')):
        continue
    trimmed = re.sub(r'\?.*$', '', url)
    if re.match(r'^https?://', trimmed, re.I):
        remote.append(url)
    elif trimmed.startswith('#') or trimmed == 'index.html' or trimmed.endswith('.html'):
        local.append(url)
    else:
        local.append(url)
        file_path = root.joinpath(trimmed).resolve()
        if not file_path.exists():
            missing.append((url, str(file_path)))
print('LOCAL URLS', len(local))
print('REMOTE URLS', len(remote))
print('MISSING LOCAL FILES', len(missing))
for url, path in missing:
    print(url, '->', path)
