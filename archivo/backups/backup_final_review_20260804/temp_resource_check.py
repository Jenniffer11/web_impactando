import os
from html.parser import HTMLParser
root = os.path.abspath(r'c:\Impactando las naciones')
html_path = os.path.join(root,'6a6b6958e14b7.site123.me','index.html')
text = open(html_path,'r',encoding='utf-8').read()
class ResParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.res = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'link' and 'href' in d and d.get('rel') in ('stylesheet','preconnect'):
            self.res.append(d['href'])
        elif tag == 'script' and 'src' in d:
            self.res.append(d['src'])
        elif tag == 'img' and 'src' in d:
            self.res.append(d['src'])
        elif tag == 'img' and 'srcset' in d:
            self.res.extend([p.split()[0] for p in d['srcset'].split(',') if p.strip()])
        elif tag == 'meta' and ('content' in d) and (d.get('property') in ('og:image','twitter:image') or d.get('itemprop') == 'image'):
            self.res.append(d['content'])
        elif tag == 'source' and 'src' in d:
            self.res.append(d['src'])
        elif tag == 'source' and 'srcset' in d:
            self.res.extend([p.split()[0] for p in d['srcset'].split(',') if p.strip()])
parser = ResParser()
parser.feed(text)
local_ok = []
local_404 = []
remote = []
for href in parser.res:
    href = href.strip()
    if not href:
        continue
    if href.startswith('http://') or href.startswith('https://'):
        remote.append(href)
        continue
    if href.startswith('data:'):
        continue
    if href.startswith('//'):
        remote.append('https:' + href)
        continue
    if href.startswith('/'):
        localpath = os.path.normpath(os.path.join(root, href.lstrip('/')))
    else:
        localpath = os.path.normpath(os.path.join(os.path.dirname(html_path), href))
    if os.path.exists(localpath):
        local_ok.append((href, localpath))
    else:
        local_404.append((href, localpath))
print('TOTAL', len(parser.res))
print('LOCAL_OK', len(local_ok))
for href, p in local_ok:
    print('OK', href, '=>', os.path.relpath(p, root))
print('LOCAL_404', len(local_404))
for href, p in local_404:
    print('404', href, '=>', os.path.relpath(p, root))
print('REMOTE', len(remote))
for href in remote:
    print('REM', href)
