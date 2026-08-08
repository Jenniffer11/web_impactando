(async () => {
  const rootUrl = 'http://127.0.0.1:8000/6a6b6958e14b7.site123.me/index.html';
  const htmlRes = await fetch(rootUrl);
  const html = await htmlRes.text();
  const hrefs = [];
  const regex = /<link[^>]*href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)[^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const val = match[1].replace(/^['"]|['"]$/g, '');
    if (val && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('//')) {
      hrefs.push(new URL(val, rootUrl).href);
    } else if (val) {
      hrefs.push(val.startsWith('//') ? 'https:' + val : val);
    }
  }
  const cssUrls = hrefs.filter(u => u.endsWith('.css') || u.includes('.css?'));
  const internalRes = [];
  const remote = [];
  for (const cssUrl of cssUrls) {
    try {
      const r = await fetch(cssUrl);
      const text = await r.text();
      const urls = [...text.matchAll(/url\(([^)]+)\)/gi)].map(m => m[1].trim().replace(/^['"]|['"]$/g, ''));
      for (const u of urls) {
        if (u.startsWith('data:')) continue;
        if (/^https?:\/\//i.test(u) || u.startsWith('//')) {
          remote.push({cssUrl, url:u, resolved:u.startsWith('//') ? 'https:'+u : u});
          continue;
        }
        let resolved = new URL(u, cssUrl).href;
        try {
          const rr = await fetch(resolved, {method:'HEAD'});
          internalRes.push({cssUrl, url:u, resolved, status: rr.status, ok: rr.ok});
        } catch (e) {
          internalRes.push({cssUrl, url:u, resolved, status:'ERROR', message:e.message});
        }
      }
    } catch (e) {
      console.error('ERROR fetching CSS', cssUrl, e.message);
    }
  }
  console.log('CSS files:', cssUrls.length);
  for (const r of internalRes) {
    console.log(`${r.ok ? 'OK' : '404'} | ${r.status} | ${r.cssUrl} | ${r.url} | ${r.resolved}${r.message? ' | '+r.message:''}`);
  }
  for (const r of remote) {
    console.log(`REMOTE | ${r.cssUrl} | ${r.url} | ${r.resolved}`);
  }
})();
