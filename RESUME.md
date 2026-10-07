# SEO work — resume point (updated 2026-10-07)

## Done (pushed)
- meta description, canonical, og:description, og:url on all public pages
- noindex on admin/student/login/signup/forgot/play/agreement/privacy-policy
- robots.txt, sitemap.xml (domain ampplifyacademy.com, GitHub Pages)
- JSON-LD: EducationalOrganization (index.html), Course (course.html)

## Not done yet — next steps, in order
1. Static HTML default text for SEO-critical content (hero, course description, module list, FAQ) in
   course.html / index.html. JS (`loadSiteContent()` in js/site-content.js) must still override from
   Firestore `siteContent/main`, so admin panel keeps working. Keep text in HTML equal to SITE_CONTENT_DEFAULTS.
2. Add FAQPage JSON-LD once FAQ text is static.
3. Optional: GitHub Action that pulls Firestore siteContent daily and rewrites the static HTML (keeps Google in sync with admin edits).
4. DONE: Search Console property https://ampplifyacademy.com/ added, verified by googlebeb6f730b2252395.html (DO NOT DELETE). Remaining: submit sitemap.xml in Search Console -> Sitemaps.
5. USER: Google Business profile, social links, backlinks; Bangla keywords content.

## Rules
Auto-commit+push every edit. Replies terse Bangla (caveman). Commit trailer: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
