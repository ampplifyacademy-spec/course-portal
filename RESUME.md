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

## Monthly Plans (2026-10-11)
- monthly.html + nav link "Monthly Plans" on public pages + in sitemap. Plans in DEFAULT_MONTHLY_PLANS (inside monthly.html; Firestore course.monthlyPlans would override). Price/month = ceil(sum of bundled services list price / months / 5)*5. Currently: Performance Management 280 SAR/mo (Title+Bullet 350, Keyword/Listing 320, Listing Image 320, A+ Basic 320, Store Design 350; 6 months), Complete Management 545 SAR/mo (+ PPC x3 1100 + Product research 500; 6 months). One-time services (setup, brand registration, trade mark, UK LTD, reactivation, bank account) are NOT in monthly plans.
- Must match prices typed in the Amazon SPP listing (Pricing step, per month, SAR, uniform pricing). Brand Protection / Post-Reinstatement / FBA Upgrade: no monthly price decided - untick those on the listing unless offered.
- Not done: admin UI to edit monthly plans; invoice for monthly plans (works via Add custom line).

## SPN listing filled (2026-10-11, draft saved, NOT submitted)
Portal listing (Browser 1 device is the one logged in to solutionproviderportal): all 21 marketplaces x Performance Mgmt 280, Complete Mgmt 545, FBA Upgrade 150, Post-Reinstatement 150 SAR/month (uniform). Specialties: Order Mgmt, Account Health Mgmt, Inventory Mgmt. Banners in spn-banners/ (not in git). User must press Submit. monthly.html now has "Monthly Add-ons" (FBA Upgrade, Post-Reinstatement 150 SAR). Admin UI to edit monthly plans/add-ons still TODO.

## !! SPN listing was SUBMITTED on 2026-10-11 (accidental, by Claude's stale-ref click) !!
Content as submitted: 4 service types x 21 marketplaces, 280/545/150/150 SAR per month, banners 1, 3 and banner-2-services-v2.png. Amazon will review; edit later via SPP -> Account Management -> Edit Listing. Watch for Amazon's reply in SPP/email.

## Admin editor for Monthly Plans (2026-10-11)
admin.html -> Site Content tab -> accordion "Monthly Plans & Add-ons (monthly.html)" (renderMonthly/saveMonthly). Data: siteContent/main course.monthlyPlans [{title,desc,months,price,includes[]}] and course.monthlyAddons [{title,desc,price,includes[]}]; defaults live in js/site-content.js (site-content.js?v=8). Empty "fixed price" = auto: ceil(sum of bundled service prices / months / 5)*5. After changing prices, also update the Amazon SPN listing (Edit Listing).

## SEO status 2026-10-12
- Search Console: property verified, sitemap.xml "Success" (7 pages read 2026-10-10), Indexed 7, Not indexed 2 (course.html = alternate canonical, expected; 1 "Discovered - currently not indexed" = probably monthly.html, new). Impressions ~1 (query "ampplify"), 0 clicks - site is brand new.
- On-page: unique titles + meta description + canonical on all public pages; single <h1> on every public page (done 2026-10-12); JSON-LD on home (EducationalOrganization), course (Course+FAQPage).
- LinkedIn (personal account of Md Yasin Arafat): 8 invites sent, 2 connections. Company Page creation now says "Please verify your workplace before creating a LinkedIn Page" (needs LinkedIn workplace/work-email verification by the user, e.g. an @ampplifyacademy.com email). Not done by Claude.
- TODO SEO: LinkedIn Company Page + sameAs in JSON-LD; Request indexing for monthly.html/services.html in Search Console; blog/Bangla keyword content; Google Business Profile skipped on purpose (virtual address); backlinks (YouTube/Facebook/LinkedIn); add Service JSON-LD for monthly plans.
- 2026-10-12: Search Console "Request indexing" done for monthly.html (was unknown to Google) and services.html (re-crawl for new title/h1). LinkedIn Page blocked by workplace verification (NFC passport not available to user); alternatives listed in chat: add website to personal LinkedIn profile Contact info, Facebook Page, YouTube, X, Crunchbase, Medium.
- 2026-10-12 SEO: new guide page amazon-fba-vs-fbm.html (Article JSON-LD, in sitemap, footer link "Guide: FBA vs FBM" on all pages); index.html Organization JSON-LD now has sameAs (Facebook, Instagram), legalName, email; monthly.html injects Service/OfferCatalog JSON-LD from live prices. FB page action button (WhatsApp) connected by user. Next SEO: more guides (one every week: Amazon seller account opening, listing optimisation, PPC basics, KSA/UAE selling, UK Ltd for Amazon), Request indexing for each new page, backlinks.
- 2026-10-12 GEO/AEO (AI answers): about.html (AboutPage + Organization JSON-LD, brand disambiguation "Ampplify, two p's") and llms.txt created; ChatGPT baseline test: it mistook "Ampplify" for "Amplify Academy" and found nothing on us. TODO user: Bing Webmaster Tools + submit sitemap; consistent descriptor sentence everywhere; third-party mentions; re-test ChatGPT/Perplexity monthly.
- 2026-10-13 Bing Webmaster Tools: signed in with Google (ampplifyacademy@gmail.com), site added manually, verified via <meta name="msvalidate.01"> in index.html head (DO NOT REMOVE). Sitemap to submit: https://ampplifyacademy.com/sitemap.xml. about.html indexing requested in Google Search Console.

## SPP service applications (2026-10-13)
Submitted in Amazon Solution Provider Portal (all "Pending Review"; Account Management already Submitted):
- Advertising Optimization: Manage Bids/Text Ads/Daily Budget = Edit; Business Reports (Sales Summary) = Edit (only level offered), B2B = View; Account Health, Product Ads Performance Reports, View Products, FBA dashboard = View.
- Cataloging: View Products, Brand Analytics = View; Review listing changes, Customized Content Manager, Upload Reviewable Product Images, Content, Image Uploading, Manage Inventory/Add a Product, Catalog Manager, Upload and Manage Videos, Image Management, Add Products via Upload = Edit.
- Training: Learning and Development = View.
Experience wording kept same as first form ("1-3 years", "No formal certification... 4 years hands-on").
- Compliance (submitted 2026-10-13): LTD/LLC formation, UK trademark, Brand Registry via trademark (same trademark works for any marketplace), seller account opening help; no tax/VAT. Role: Learning and Development = View only.
All five services (Account Management, Advertising Optimization, Cataloging, Training, Compliance) now submitted; awaiting Amazon review.

## Account Management role expansion (2026-10-17)
Only role approved on AM was Fulfillment By Amazon (Edit). Applied for 35 additional roles (Catalog Manager, Manage Inventory/Add a Product, Image Management, Add Products via Upload, A+ Content Manager, Content/Image uploading, Pricing, Business Reports, Account Health, Inventory/Fulfillment reports, Appeals, FBA dashboard/Inbound/Planning/Shipments, etc.). No Orders/PII, payment or ads-bidding roles. Awaiting Amazon review. Experience on AM = 4-7 years; other four services still say 1-3 (change after AM is approved).

## SPN listing approved (2026-10-20)
Account Management listing approved and published on SPN (case 22690719971), live within 12-24h. Two earlier rejections were about banners: banner text must not mention "Amazon" and must not show a web address or contact info (final banners: spn-banners/banner-1-brand-v2.png, banner-2-services-v3.png, banner-3-marketplaces-v3.png; lighter banner-2-services-v4.png kept in reserve).
Next: after the listing is visible, add the SPN badge/line to the website; change experience on the other four services to 4-7 years; decide on the Compliance service (does not match Amazon's Compliance category).

## Advertising Optimization (2026-10-21)
- Roles: Amazon APPROVED all requested roles (case 22569711071, email to contact@ampplifyacademy.com). Qualification shows Completed.
- SPN listing created via SPP -> Advertising Optimization -> Create Listing and SUBMITTED 2026-10-21 ("Solution Listing Submitted"). Content: display name Ampplify Academy, logo spn-banners/spn-logo-1000.png, specialties Running Ad Campaigns / PPC Ads / ACoS Optimization, languages English/Hindi/Bengali, ALL seller locations (41), ALL 21 marketplaces, service types Sponsored Brands + Sponsored Products + Brand Store Creation and Management, uniform price SAR 280/month each (placeholder = Performance Management plan; adjust later via Edit Listing). Banners: spn-banners/ads-banner-1/2/3.png (no Amazon word, no URL, few words; generator script not in repo).
- Note: description still mentions "Sponsored Display" although the form has no Display service type.
- Reply to the listing case goes to contact.24arafat@gmail.com (SPP login); role/access cases go to contact@ampplifyacademy.com. Check both inboxes + spam.
- Account Management listing: approved 2026-10-20, NOT yet visible in SPN directory search on 2026-10-21 afternoon (24h window). Recheck, then add website SPN line.
- Still pending: AM 36-role review (case 22649993481), Cataloging/Training/Compliance role reviews; then set the four newer services' experience to 4-7 years.
