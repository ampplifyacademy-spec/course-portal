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

## SEO guides (2026-10-21)
- Published 4 guides: how-to-open-amazon-seller-account, amazon-ppc-basics, amazon-listing-optimization-guide, selling-on-amazon-saudi-arabia-uae (footer links on all pages, sitemap.xml 14 URLs, llms.txt). Generator: scripts/make_guide.py + scripts/guides/*.json.
- Google Search Console "Request indexing" done for the first 3; selling-on-amazon-saudi-arabia-uae.html STILL TO REQUEST (usage limit hit).
- Weekly scheduled task "ampplify-weekly-seo-guide" (Mondays ~10:00) writes one more guide per week from a topic queue and pushes it; Request indexing stays manual.
- 2026-11-08: Amazon Brand Registry and trademarks — https://ampplifyacademy.com/amazon-brand-registry-and-trademarks.html (live 200; Request indexing TODO)
- Search Console 2026-10-21: 10 indexed, 2 not indexed, 0 clicks. Still TODO: Bing sitemap submit, backlinks (Facebook, YouTube, X, Crunchbase, Medium, LinkedIn personal profile website field), LinkedIn Company Page blocked.

## Advertising Optimization LIVE on SPN (2026-10-22)
Public SPN search (Advertising Optimization, provider name "Ampplify Academy") now lists us: "Starts at USD 74.67 per month" (= SAR 280), languages English/Hindi/Bengali. Support case 22726119711 open (asked Amazon to confirm; corrected to Ads only). Account Management listing: see next check. Website SPN line can now be added for Advertising Optimization only after the user agrees on wording (say "listed on Amazon Service Provider Network", never "Amazon partner/endorsed").

## SEO status 2026-10-22
- Search Console: all new guide pages (selling-on-amazon-saudi-arabia-uae, give-access-to-service-provider, plus the earlier three) show "URL is on Google / Page is indexed". Property is URL-prefix https://ampplifyacademy.com/ (not a domain property); logged in on the Chrome device that holds ampplifyacademy@gmail.com.
- Bing Webmaster: sitemap.xml resubmitted 2026-10-22 ("Processing"); earlier 10 URLs discovered; site has 15 URLs now.
- Weekly guide task still scheduled (Mondays ~10:00).
- Still TODO (needs the user): backlinks / profiles (Facebook page done, YouTube, X, Crunchbase, Medium, LinkedIn personal profile website field); LinkedIn Company Page blocked by workplace verification; Facebook cover with SPN badge made (spn-banners/fb-cover-spn.png) but upload is the user's; site wording for SPN listing (safe wording: "Listed on Amazon Service Provider Network"); re-check SPN listing visibility.

## SEO status 2026-11-02 (SEO session)
- Audit: all 17 sitemap URLs 200. Added Course+FAQPage JSON-LD to index.html (was only on course.html), Service+BreadcrumbList JSON-LD on llc/ltd, llc/ltd in llms.txt (fe7b6ce).
- Google AI Mode re-test: brand queries (incl. "Ampplify Academy Rakiza Company LTD", "...ampplifyacademy.com") now answer correctly and cite our site. "What is Ampplify Academy?" still shows only Amplify orgs. AI Mode repeated "Sponsored Display", "1-on-1 coaching calls", "6+ modules" vs "29 modules": check site wording.
- Search Console (28 days): 1 click, 145 impressions, avg position 54.3; top queries amazon ppc (43), amazon fba or fbm (11), ampplify (9). 15 indexed, 3 not (2 alternate canonical, 1 discovered-not-indexed). Sitemap read 2026-11-01, 17 URLs, Success. Request indexing done 2026-11-02 for llc.html and ltd.html.
- Weekly guide task: 2026-10-26 run stopped after 1 tool call (no commit, cause unknown); no guide since 2026-10-22. 2026-11-02 run in progress. Bing check still TODO.
- 2026-11-02 Bing: sitemap.xml last crawl 2026-10-27, Success, 15 URLs discovered; submitted llc.html, ltd.html and home via URL Submission (3 of 100/day). Home chip "6+ Modules" -> "29+ Modules" (1095867).
- 2026-11-02 descriptor audit: Facebook About, Crunchbase, site about/index JSON-LD/llms.txt carry the facts (Rakiza, two p's on site) but only about.html/llms.txt/JSON-LD carry the "not Amplify Academy" disambiguation. Medium profile has no bio. YouTube/X not created yet.
- 2026-11-02: Medium short bio set to "Ampplify Academy (two p's): Amazon seller training and account management. Not Amplify Academy (HR). ampplifyacademy.com". Facebook About line NOT added (Page needs "Switch" into Page profile; user to do). WARNING: Facebook cover image shows "amazon spn certified" text + Amazon logo, which breaks SPN wording rules -> replace with spn-badge based cover. Weekly guide task sessions (10-26, 11-02) both stall right after the first Read/Glob/Bash calls (cwd C:\Users\arafa); 11-02 session still "running" with no activity since start; likely waiting on a tool permission prompt.
- SEO guide 2026-11-03 (written by hand, weekly task stalled): UK Ltd company for Amazon sellers, https://ampplifyacademy.com/uk-ltd-company-for-amazon-sellers.html. Request indexing in Search Console still manual.

## SEO + speed status 2026-11-08
- Search Console 28d: 2 clicks, 167 impressions, avg position 55.8; 15 indexed, 3 not (2 alternate canonical, 1 discovered-not-indexed). Top queries: amazon ppc (43 impr), amazon fba or fbm (12), ampplify (10). CWV: not enough field data yet.
- PageSpeed mobile home BEFORE: perf 60, a11y 82, best-practices 96, SEO 92; FCP 4.0s, LCP 18.6s, SI 7.4s, TBT 0, CLS 0.015. Desktop perf 84, LCP 2.4s. Cause: hero image was a 1.6 MB PNG via Google Drive proxy.
- Fixes: hero now assets/hero-instructor.webp (55 KB), logo-sm.webp on public pages (807ea05); Google Fonts non-blocking (4c8fe24). After 807ea05: mobile perf 72, LCP 4.0s, FCP 4.0s, SI 7.5s. Re-test after fonts change not completed (browser tab closed).
- Still slow: FCP 4.0s on throttled mobile (render-blocking css, 3 Firebase compat scripts sync at page end, animations.css mid-body). Ideas: defer firebase, inline critical css, cache headers (GitHub Pages fixed), compress mascot/company-seal/og-image PNGs.
- Guides: UK Ltd guide published 2026-11-03 (b8638d4). Weekly task still stalled (user must Always allow in run session).
- 2026-11-08: Search Console Request indexing done for uk-ltd-company-for-amazon-sellers.html and amazon-brand-registry-and-trademarks.html. Weekly guide task unstuck after user clicked Always allow (guide ed458b8 written by the task). Facebook Page currently shows NO cover photo (old "amazon spn certified" cover removed); new cover is spn-banners/fb-cover-v2.png (not in git), upload is the user's. Note: Chrome device selection resets when the tab group is recreated; always re-select fb2927dd (Ampplify logins) and check the account.
- SEO guide 2026-11-11 (hand-written; the 2026-11-09 scheduled run was interrupted at its first PowerShell permission prompt, so no guide that week): Amazon account health and suspensions, https://ampplifyacademy.com/amazon-account-health-and-suspensions.html. Request indexing still manual.
- 2026-11-11: Request indexing done for amazon-account-health-and-suspensions.html. Search Console now 16 indexed, 4 not indexed. Chrome device selection keeps falling back to e6f30481 (SPP); re-select fb2927dd right before each step and check the account button shows ampplifyacademy@gmail.com.
- 2026-11-14 speed (user's PSI run 99ot09cucj): mobile perf 60, LCP 21.6s, total 19 MB, of which ~14 MB was Facebook video review iframes (4 cards) loading on page load. Fix 034fc56: cards are now click-to-play buttons (iframe created on click, with title), site-content.js?v=24 on all pages; SPN badge now assets/spn-badge.webp 462px (17 KB, was 41 KB PNG); nav anchors got href; rating select got aria-label. Remaining: animations.css render-blocking mid-body (560 ms), Firebase compat scripts unused JS (~145 KB), heading order, main landmark, colour contrast on hero badge/highlight. Re-test PSI not completed (built-in browser pane hidden).
- 2026-11-14 PSI after 034fc56 (run isl9o402wu): mobile perf 64 / a11y 92 / BP 96 / SEO 100, FCP 4.0s, LCP 5.8s (was 21.6s), total 725 KiB (was 19 MB). Desktop perf 95, LCP 1.1s. Remaining mobile: LCP element render delay ~4.7s (hero entrance animations + css), Firebase compat JS. 82d74db adds preload for animations.css.
