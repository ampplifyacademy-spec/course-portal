# SEO work — resume point (updated 2026-10-07)

## Done (pushed)
- meta description, canonical, og:description, og:url on all public pages
- noindex on admin/student/login/signup/forgot/play/agreement/privacy-policy
- robots.txt, sitemap.xml (domain ampplifyacademy.com, GitHub Pages)
- JSON-LD: EducationalOrganization (index.html), Course (course.html)

## Not done yet — next steps, in order
1. DONE 2026-10-07: module list (29) + FAQ (4) baked into course.html static HTML + FAQPage JSON-LD (JS still overrides). Re-bake if admin changes modules/FAQ (script idea: fetch Firestore REST siteContent/main, public read, key in js/firebase-config.js).
   course.html / index.html. JS (`loadSiteContent()` in js/site-content.js) must still override from
   Firestore `siteContent/main`, so admin panel keeps working. Keep text in HTML equal to SITE_CONTENT_DEFAULTS.
2. DONE (FAQPage JSON-LD added).
3. Optional: GitHub Action that re-bakes static HTML (modules, FAQ, services) from Firestore. index.html, course.html, services.html baked 2026-10-07; plans (priced) and review grids intentionally left dynamic.
4. DONE: Search Console property https://ampplifyacademy.com/ added, verified by googlebeb6f730b2252395.html (DO NOT DELETE). sitemap.xml submitted 2026-10-07 (success). Next: request indexing for key URLs via URL inspection after a few days.
5. USER: Google Business profile, social links, backlinks; Bangla keywords content.

## Rules
Auto-commit+push every edit. Replies terse Bangla (caveman). Commit trailer: Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

## CONSTRAINT: Amazon SPN review in progress
Keep services.html, success-stories.html, expertise sections, company details (Rakiza Company LTD, 128 City Road, London EC1V 2NX) visible + static + indexable. Never fabricate testimonials. Real client testimonials still needed from the user.
