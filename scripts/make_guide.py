"""Stamp a new guide page from amazon-fba-vs-fbm.html (head, nav, footer reused).
Usage: python scripts/make_guide.py scripts/guides/<slug>.json
JSON: slug, title, description, headline, date (YYYY-MM-DD), minutes, link_label, body_html, cta_html
After stamping: add the page to sitemap.xml, llms.txt and the footer of every page
(this script does all three)."""
import json, re, sys, glob, os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8', newline='').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf-8', newline='').write(s)

g = json.load(open(sys.argv[1], encoding='utf-8'))
slug, url = g['slug'], 'https://ampplifyacademy.com/%s.html' % g['slug']
t = rd('amazon-fba-vs-fbm.html')
nl = '\r\n' if '\r\n' in t else '\n'
t = t.replace('\r\n', '\n')
esc = lambda s: html.escape(s, quote=True)
full_title = g['title'] + ' · Ampplify Academy'

# head
t = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % esc(g['description']), t, 1)
t = t.replace('https://ampplifyacademy.com/amazon-fba-vs-fbm.html', url)
t = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % esc(g['description']), t, 1)
t = re.sub(r'<title>.*?</title>', '<title>%s</title>' % esc(full_title), t, 1)
t = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s">' % esc(full_title), t, 1)
ld = {"@context": "https://schema.org", "@type": "Article", "headline": g['headline'], "description": g['description'],
      "inLanguage": "en", "datePublished": g['date'], "dateModified": g['date'], "mainEntityOfPage": url,
      "author": {"@type": "Organization", "name": "Ampplify Academy"},
      "publisher": {"@type": "Organization", "name": "Ampplify Academy",
                    "logo": {"@type": "ImageObject", "url": "https://ampplifyacademy.com/assets/icon-512.png"}}}
t = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: '<script type="application/ld+json">%s</script>' % json.dumps(ld), t, 1, flags=re.S)

# article
months = ['January','February','March','April','May','June','July','August','September','October','November','December']
y, mo, d = g['date'].split('-')
pretty = '%d %s %s' % (int(d), months[int(mo) - 1], y)
art = ('<article class="guide">\n  <h1>%s</h1>\n  <p class="meta">By Ampplify Academy &middot; Updated %s &middot; %s min read</p>\n%s\n\n'
       '  <div class="cta">\n    <p>%s</p>\n  </div>\n'
       '  <p style="font-size:.88rem;color:var(--text-muted);">This guide is general information, not financial or legal advice. Amazon\'s fees and rules change, so always check the current pages in Seller Central before you decide.</p>\n</article>'
       % (esc(g['headline']).replace('&#x27;', "'"), pretty, g['minutes'], g['body_html'], g['cta_html']))
t = re.sub(r'<article class="guide">.*?</article>', lambda m: art, t, 1, flags=re.S)
wr(slug + '.html', t.replace('\n', nl))

# link everywhere (footer), sitemap, llms.txt
link = '<a href="%s.html">Guide: %s</a>' % (slug, g['link_label'])
for f in glob.glob(os.path.join(ROOT, '*.html')):
    s = open(f, encoding='utf-8', newline='').read()
    if link in s or 'Guide: FBA vs FBM</a>' not in s: continue
    s = re.sub(r'([ \t]*)(<a href="amazon-fba-vs-fbm.html">Guide: FBA vs FBM</a>)(\r?\n)',
               lambda m: m.group(1) + m.group(2) + m.group(3) + m.group(1) + link + m.group(3), s, 1)
    open(f, 'w', encoding='utf-8', newline='').write(s)
sm = rd('sitemap.xml')
if url not in sm:
    wr('sitemap.xml', sm.replace('</urlset>', '<url><loc>%s</loc></url>\n</urlset>' % url))
ll = rd('llms.txt')
if url not in ll:
    wr('llms.txt', ll.replace('- [Guide: Amazon FBA vs FBM](https://ampplifyacademy.com/amazon-fba-vs-fbm.html)',
        '- [Guide: Amazon FBA vs FBM](https://ampplifyacademy.com/amazon-fba-vs-fbm.html)\n- [Guide: %s](%s)' % (g['link_label'], url)))
print('ok', slug)
