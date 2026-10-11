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

NOTE: course.html is a duplicate of index.html with canonical -> home (intentional). It is NOT in sitemap. Keep index.html and course.html content in sync.

Search Console status 2026-10-07: home page already indexed. "Request indexing" gave "Oops! Something went wrong" (Google-side, retry later by hand: URL inspection -> paste URL -> REQUEST INDEXING for services.html, success-stories.html, partnership.html, portfolio.html). Sitemap showed "Couldn't fetch" right after submit (normal for new sitemaps; file is 200 OK) - recheck in 1-2 days.

## Admin tools added 2026-10-11
- invoice.html (admin-only, linked in admin sidebar "Invoice"): pick a client (users with purchases), prefilled services/prices from siteContent services, custom lines, discount, Paid/Due stamp, seller+payment details (saved in config/invoiceSettings), sequential numbers via config/invoiceCounter, Print/Save as PDF.
- agreement.html: new "Services sold on our website" tick list (all 21 site services, class svc so they print in services list + Schedule A) + "Load from a client's purchase" selector; fee auto-fills with list-price total.
- Not done: per-service legal clauses (agreement lists the ticked services; the clause text is generic). Saving invoices to Firestore history (needs firestore.rules change for an `invoices` collection).

## 2026-10-11 update
- agreement.html: SERVICE_TERMS / SERVICE_COMMON_TERMS (above buildDoc) = per-service clauses, printed as "Service-Specific Terms" for every ticked website service (matched by title regex). DRAFT wording, needs lawyer review. New website service => add a regex+terms entry.
- invoice.html: official logo assets/logo.png (cartoon siteLogoUrl no longer used), seal+signature+date block (toggle), default status = Due, Paid only when admin sets it (auto-paid only if user.amountPaid && not refunded), paid date field, payment details prefilled from siteContent bankDetails.accounts.
- invoice.html (2026-10-11): numbers are automatic, format AMP-YYMM-0001 (brand + invoice year/month + running number; counter config/invoiceCounter, assigned on Save). Every invoice saved as Firestore doc config/invoice-<no> with field kind:'invoice' (config is admin-only, so no rules change). "Saved invoices" list: Open, Mark paid. Test doc was deleted and counter reset to 0 after verification.
