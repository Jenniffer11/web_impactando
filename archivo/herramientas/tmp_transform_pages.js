const fs = require('fs');
const path = require('path');
const files = [
  {src: '6a6b6958e14b7.site123.me/index-2.html', dest: 'index.html', systemCss: 'minimize_appBuilder_v34d51.css'},
  {src: '6a6b6958e14b7.site123.me/bautizos.html', dest: 'bautizos.html', systemCss: 'minimize_appBuilder_v34d51.css'},
  {src: '6a6b6958e14b7.site123.me/cruzadas.html', dest: 'cruzadas.html', systemCss: 'minimize_appBuilder_v34d51.css'},
  {src: '6a6b6958e14b7.site123.me/libros.html', dest: 'libros.html', systemCss: 'minimize_appBuilder_v34d51.css'},
];

const toLocalImg = (url) => {
  const file = url.replace(/.*\//, '').replace(/\?.*$/, '');
  return `img/${file}`;
};

const rewriteSrcset = (orig) => {
  const matches = [...orig.matchAll(/(?:https?:)?\/\/[^,\s"']*files\.cdn-files-a\.com\/uploads\/12291293\/([^"',\s]+)/g)];
  if (!matches.length) return orig;
  const local = toLocalImg(matches[0][1]);
  return `srcset="${local} 800w"`;
};

for (const file of files) {
  const raw = fs.readFileSync(file.src, 'utf8');
  let content = raw;

  content = content.replace(/<!--\s*Mirrored from[\s\S]*?-->/gi, '');
  content = content.replace(/<!--\s*Added by HTTrack\s*-->[\s\S]*?<!--\s*\/Added by HTTrack\s*-->/gi, '');
  content = content.replace(/<meta http-equiv="content-type"[^>]*>\s*/gi, '');
  content = content.replace(/<base[^>]*>\s*/gi, '');
  content = content.replace(/<script>window\.[\s\S]*?<\/script>\s*/gi, '');

  content = content.replace(/<link rel="stylesheet" href="\.\.\/cdn-cms-s-8-4\.f-static\.net\/versions\/2\/system_mini\/css\/[^">]+"[^>]*>/gi, `<link rel="stylesheet" href="css/${file.systemCss}">`);
  content = content.replace(/<link rel="stylesheet" href="\.\.\/cdn-cms-s-8-4\.f-static\.net\/manager\/ai_app_builder\/v3\/assets\/minimize_css\/([^"?]+)(?:\?[^"']*)?"[^>]*>/gi,
    (match, cssFile) => `<link rel="stylesheet" href="css/${cssFile}">`);
  content = content.replace(/<link rel="stylesheet" href="\.\.\/cdn-cms-s-8-4\.f-static\.net\/manager\/ai_app_builder\/v3\/assets\/css\/([^"?]+)(?:\?[^"']*)?"[^>]*>/gi,
    (match, cssFile) => `<link rel="stylesheet" href="css/${cssFile}">`);
  content = content.replace(/<link rel="stylesheet" href="\.\.\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.7\.2\/css\/all\.min\.css"[^>]*>/gi,
    '<link rel="stylesheet" href="css/all.min.css">');

  content = content.replace(/(src|href)="\.\.\/files\.cdn-files-a\.com\/uploads\/12291293\/([^"\?]+)(?:\?[^"\']*)?"/gi,
    (match, attr, fileName) => `${attr}="img/${fileName}"`);
  content = content.replace(/srcset="[^"]*files\.cdn-files-a\.com\/uploads\/12291293\/[^"\']*"/gi, rewriteSrcset);

  content = content.replace(/href="index-2\.html/g, 'href="index.html');
  content = content.replace(/href="\.\.\/index-2\.html/g, 'href="index.html');

  const destName = path.basename(file.dest);
  content = content.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${destName}"/>`);
  content = content.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/gi, `<meta property="og:url" content="${destName}">`);
  content = content.replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/gi, `<meta name="twitter:url" content="${destName}">`);

  content = content.replace(/<script src="\.\.\/cdn-cms-s-8-4\.f-static\.net\/manager\/ai_app_builder\/v3\/assets\/js\/app7f4a\.js[^"]*"><\/script>[\s\S]*?<\/body>/gi,
    '  <script defer src="js/app.js"></script>\n</body>');

  content = content.replace(/<script[^>]*src="\.\.\/cdn-cms-s-8-4\.f-static\.net[^"]*"[^>]*><\/script>\s*/gi, '');
  content = content.replace(/<script>var siteRefTxt=[\s\S]*?<\/script>\s*/gi, '');
  content = content.replace(/<script>var packageNUM=1;<\/script>\s*/gi, '');
  content = content.replace(/<div id="showSmallAdOnScroll"[\s\S]*?<\/div>\s*/gi, '');
  content = content.replace(/<script>window\.APP_[\s\S]*?<\/script>\s*/gi, '');
  content = content.replace(/<!--\s*Mirrored from[\s\S]*$/gi, '');

  fs.writeFileSync(file.dest, content, 'utf8');
  console.log(`Generated ${file.dest}`);
}
