(async () => {
  const rootUrl = 'http://127.0.0.1:8000/6a6b6958e14b7.site123.me/index.html';
  const res = await fetch(rootUrl);
  const html = await res.text();
  const urls = new Set();
  const attrRegex = /<(link|script|img|source|meta)\b[^>]*?(?:href|src|srcset|content)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
  const propRegex = /(?:property|name|itemprop)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
  const normalized = s => s.replace(/^['"]|['"]$/g, '').trim();
  let match;
  const add = v => { if (!v) return; const t=v.trim(); if (t) urls.add(t); };
  // capture href/src/content/srcset values
  while ((match = attrRegex.exec(html)) !== null) {
    const token = match[0];
    const nmatch = /(?:href|src|content)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(token);
    if (nmatch) {
      const attr = normalized(nmatch[1]);
      if (/^https?:\/\//i.test(attr) || attr.startsWith('//') || attr.startsWith('/') || attr.startsWith('.') || attr.startsWith('data:')) {
        if (attr.toLowerCase().startsWith('data:')) continue;
        if (attr.toLowerCase().startsWith('http') || attr.startsWith('//')) add(attr);
        else if (attr.includes('srcset')) {
          // actually this won't happen here
          add(attr);
        } else add(attr);
      }
    }
  }
  // special for srcset within tags
  const srcsetRegex = /(?:srcset|image)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const attr = normalized(match[1]);
    attr.split(',').forEach(part => {
      const url = part.trim().split(/\s+/)[0];
      if (url) add(url);
    });
  }
  // meta tag filtering for og:image twitter:image itemprop=image
  const metaRegex = /<meta\b[^>]*?(?:property|name|itemprop)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)[^>]*?>/gi;
  while ((match = metaRegex.exec(html)) !== null) {
    const tag = match[0];
    const propMatch = /(?:property|name|itemprop)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(tag);
    const prop = propMatch ? normalized(propMatch[1]) : '';
    if (['og:image','twitter:image','image'].includes(prop) || prop === 'image') {
      const contentMatch = /content\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i.exec(tag);
      if (contentMatch) add(normalized(contentMatch[1]));
    }
  }
  const results = [];
  for (const href of urls) {
    let remote = false;
    let final = href;
    if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
      remote = true;
      if (href.startsWith('//')) final = 'https:' + href;
    } else {
      final = new URL(href, rootUrl).href;
    }
    if (remote) {
      results.push({href, resolved: final, remote: true, status: 'REMOTE'});
      continue;
    }
    try {
      const r = await fetch(final, {method:'HEAD'});
      results.push({href, resolved: final, remote:false, status:r.status, ok:r.ok});
    } catch (e) {
      results.push({href, resolved: final, remote:false, status:'ERROR', message:e.message});
    }
  }
  console.log('RESOURCE COUNT', results.length);
  results.sort((a,b)=>a.href.localeCompare(b.href));
  for (const r of results) {
    console.log(`${r.remote ? 'REMOTE' : r.ok ? 'OK' : '404'} | ${r.status} | ${r.href} | ${r.resolved}${r.message ? ' | '+r.message : ''}`);
  }
})();
