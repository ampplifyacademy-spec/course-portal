function toNum(val) {
  return parseFloat(String(val || '').replace(/,/g, '')) || 0;
}

function formatMoney(val) {
  return toNum(val).toLocaleString('en-US');
}

function driveImgUrl(url) {
  if (!url) return url;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}

const SITE_CONTENT_DEFAULTS = {
  theme: { accent: '#2563eb', accentOrange: '#fd7d01', bg: '#ffffff' },
  social: { facebook: '', instagram: '', whatsapp: '' },
  footer: { tagline: '', email: 'ampplifyacademy@gmail.com', phone: '+880 1571 068040', address: 'Rakiza Company LTD, 128 City Road, London, EC1V 2NX, United Kingdom' },
  bankDetails: {
    accounts: [
      { bankName: '', accountName: '', accountNumber: '', iban: '' }
    ],
    instructions: 'Transfer the course fee to one of the accounts above, then upload your payment receipt below.',
    uploadScriptUrl: ''
  },
  landing: {
    heroTitlePrefix: 'Learn skills that',
    heroHighlight: 'actually pay off',
    heroSubtitle: "Get access to the full Ampplify Academy course library on Google Drive. Sign up, complete your payment, and we'll approve your account so you can start learning."
  },
  course: {
    heroTitlePrefix: 'Build a Real Amazon Business —',
    heroHighlight: 'Without the Guesswork',
    heroSubtitle: "A step-by-step Amazon Selling Course that takes you from zero to your first profitable product — sourcing, listings, ads, and scaling, all in one place.",
    priceOld: '1200',
    priceNew: '320',
    offerEndsAt: '',
    priceFeatures: [
      '6 in-depth video modules', 'Product research spreadsheet templates', 'Private student community access',
      'Listing & PPC swipe files', 'Lifetime updates to all content', '14-day money-back guarantee'
    ],
    currency: 'SAR',
    mentorName: 'Yasin Arafat',
    mentorBio: "I've spent the last 4 years selling on Amazon full-time. This course is everything I wish someone had handed me on day one — no fluff, just what actually works.",
    heroImageUrl: '',
    siteLogoUrl: '',
    curriculumTopics: [
      { title: 'Amazon Seller Account Setup', desc: 'Register your seller account correctly the first time and avoid the common mistakes that get new sellers suspended.', duration: '45 min' },
      { title: 'Product Research & Sourcing', desc: 'Find profitable products with real demand, validate them with data, and source reliable suppliers.', duration: '1.5 hr' },
      { title: 'Listing Optimization & SEO', desc: 'Write titles, bullets, and images that rank and convert — using the same keyword process used for real listings.', duration: '1 hr' },
      { title: 'PPC Advertising Mastery', desc: 'Launch and optimize Sponsored Products campaigns without wasting your ad budget on guesswork.', duration: '2 hr' },
      { title: 'Inventory & FBA Logistics', desc: 'Plan shipments, avoid stockouts, and manage FBA fees so restocking never catches you off guard.', duration: '1 hr' },
      { title: 'Scaling to 6-Figures', desc: 'Systems and outsourcing strategies to grow past your first product without working more hours.', duration: '1.5 hr' }
    ],
    testimonials: [
      { name: 'Tanvir Ahmed', result: 'Strong growth by month 4', quote: "I had zero experience and launched my first product in three weeks. The PPC module alone paid for the course many times over." },
      { name: 'Priya Sharma', result: 'First sale within 30 days', quote: "Yasin Arafat explains things like a friend, not a professor. No fluff, just the exact steps I needed to follow." },
      { name: 'Ahmed Raza', result: 'Scaled to 3 products', quote: "The sourcing framework saved me from two bad supplier deals before I even spent a dollar. Worth every penny." }
    ],
    faqs: [
      { q: 'Do I need any experience to start?', a: 'None at all. The course starts from zero and assumes you have never sold on Amazon before.' },
      { q: 'How long do I have access?', a: 'Lifetime. Pay once and keep access to all current and future module updates.' },
      { q: 'How much money do I need to start selling?', a: 'We cover budget-friendly sourcing strategies — most students start with a modest initial inventory budget.' },
      { q: 'Is there support if I get stuck?', a: 'Yes — every student gets access to a private community where Yasin Arafat answers questions directly.' },
      { q: "What if the course isn't for me?", a: "There's a 14-day money-back guarantee, no questions asked." }
    ],
    services: [
      { title: 'Amazon Account Setup', desc: 'We set up your Seller Central account correctly from day one.', price: '150', imageUrl: '', points: ['Seller Central registration', 'Category & brand approval guidance', 'Store policy setup'] },
      { title: '1-on-1 Coaching Call', desc: 'A private call to review your store and plan next steps.', price: '80', imageUrl: '', points: ['60-minute live call', 'Store & listing review', 'Personalized action plan'] }
    ],
    successStories: [
      { name: 'Tanvir Ahmed', text: 'Launched his first product in 3 weeks and hit consistent monthly sales within 2 months.', imageUrl: '' }
    ],
    videoReviews: [],
    tools: [],
    plans: [
      { title: 'Private Label (PL)', desc: 'Full-service management for your own private-label brand.', basePrice: '', includedServices: [], oneTimeCosts: [] },
      { title: 'Micro Private Label (MPL)', desc: 'Full-service management on a smaller, lower-cost private-label setup.', basePrice: '', includedServices: [], oneTimeCosts: [] }
    ],
    partnershipCosts: [
      { label: 'Listing image design & A+ content', amount: '' },
      { label: 'Trademark registration', amount: '' },
      { label: 'EIN/UPC code', amount: '' },
      { label: 'Product sourcing cost', amount: '' }
    ],
    portfolio: [],
    portfolioFolders: []
  }
};

function applySiteTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.accent) root.style.setProperty('--accent', theme.accent);
  if (theme.accentOrange) root.style.setProperty('--accent-orange', theme.accentOrange);
  if (theme.bg) {
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--bg-alt', theme.bg);
  }
}

function loadSiteContent() {
  return db.collection('siteContent').doc('main').get()
    .then(doc => {
      const data = doc.exists ? doc.data() : {};
      const merged = {
        theme: Object.assign({}, SITE_CONTENT_DEFAULTS.theme, data.theme || {}),
        social: Object.assign({}, SITE_CONTENT_DEFAULTS.social, data.social || {}),
        footer: Object.assign({}, SITE_CONTENT_DEFAULTS.footer, data.footer || {}),
        bankDetails: Object.assign({}, SITE_CONTENT_DEFAULTS.bankDetails, data.bankDetails || {}),
        landing: Object.assign({}, SITE_CONTENT_DEFAULTS.landing, data.landing || {}),
        course: Object.assign({}, SITE_CONTENT_DEFAULTS.course, data.course || {})
      };
      if (!data.bankDetails || !data.bankDetails.accounts || !data.bankDetails.accounts.length) {
        merged.bankDetails.accounts = SITE_CONTENT_DEFAULTS.bankDetails.accounts;
      }
      if (!data.course || !data.course.curriculumTopics || !data.course.curriculumTopics.length) {
        merged.course.curriculumTopics = SITE_CONTENT_DEFAULTS.course.curriculumTopics;
      }
      // The built-in sample testimonials and success story only appear when the
      // admin turns on "Show sample reviews" (siteContent/main.showSampleReviews).
      merged.showSampleReviews = data.showSampleReviews === true;
      if (!data.course || !data.course.testimonials || !data.course.testimonials.length) {
        merged.course.testimonials = merged.showSampleReviews ? SITE_CONTENT_DEFAULTS.course.testimonials : [];
      }
      if (!data.course || !data.course.faqs || !data.course.faqs.length) {
        merged.course.faqs = SITE_CONTENT_DEFAULTS.course.faqs;
      }
      if (!data.course || !data.course.services || !data.course.services.length) {
        merged.course.services = SITE_CONTENT_DEFAULTS.course.services;
      }
      if (!data.course || !data.course.successStories || !data.course.successStories.length) {
        merged.course.successStories = merged.showSampleReviews ? SITE_CONTENT_DEFAULTS.course.successStories : [];
      }
      applySiteTheme(merged.theme);
      return merged;
    })
    .catch(() => {
      applySiteTheme(SITE_CONTENT_DEFAULTS.theme);
      return SITE_CONTENT_DEFAULTS;
    });
}

const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13c-1.55 0-3-.42-4.24-1.15l-.3-.18-3.12.76.76-3.04-.2-.31A8.13 8.13 0 1 1 12.04 20.13Zm4.5-6.1c-.25-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.73 2.64 4.2 3.7.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28Z"/></svg>'
};

function renderSocialNav(social, elId) {
  const el = document.getElementById(elId || 'navSocial');
  if (!el) return;
  const links = [];
  if (social && social.facebook) links.push(`<a href="${social.facebook}" target="_blank" aria-label="Facebook">${SOCIAL_ICONS.facebook}</a>`);
  if (social && social.instagram) links.push(`<a href="${social.instagram}" target="_blank" aria-label="Instagram">${SOCIAL_ICONS.instagram}</a>`);
  if (social && social.whatsapp) links.push(`<a href="${social.whatsapp}" target="_blank" aria-label="WhatsApp">${SOCIAL_ICONS.whatsapp}</a>`);
  el.innerHTML = links.join('');
}

const FOOTER_ICONS = {
  pin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.2-8 5-8-5V6l8 5 8-5Z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.76 4.87-1.28A10 10 0 1 0 12 2Zm5.3 14.1c-.22.63-1.3 1.2-1.8 1.27-.46.07-1.05.1-1.7-.1a15.5 15.5 0 0 1-1.53-.57c-2.7-1.16-4.45-3.87-4.59-4.05-.13-.18-1.1-1.46-1.1-2.79 0-1.32.7-1.97.94-2.24.25-.27.54-.34.72-.34h.51c.17 0 .39-.06.61.46.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.09.18-.13.29-.27.45l-.4.47c-.13.13-.28.28-.12.55.16.27.7 1.16 1.51 1.88 1.04.93 1.91 1.21 2.18 1.35.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.58.75 1.85.88.27.13.45.2.52.31.07.11.07.64-.15 1.27Z"/></svg>'
};

function renderSiteFooter(footer, social) {
  const el = document.getElementById('siteFooter');
  if (!el) return;
  const f = footer || {};
  // Each page ships the contact details as plain HTML so they stay readable with
  // JavaScript off (Amazon's Solution Provider review loads the site that way).
  // Firestore values only overwrite that markup when the admin has set them.
  const setLine = (id, value, icon, href) => {
    const line = document.getElementById(id);
    if (!line || !value) return;
    const body = href
      ? '<a href="' + href + value.replace(/\s/g, '') + '">' + value + '</a>'
      : '<span>' + value + '</span>';
    line.innerHTML = icon ? '<span class="ficon">' + icon + '</span>' + body : value;
    line.style.display = '';
  };
  setLine('footerTagline', f.tagline);
  setLine('footerEmail', f.email, FOOTER_ICONS.mail, 'mailto:');
  setLine('footerPhone', f.phone, FOOTER_ICONS.phone, 'tel:');
  setLine('footerAddress', f.address, FOOTER_ICONS.pin);
  const copyright = document.getElementById('footerCopyright');
  // The registered company name belongs in the footer, not only in the privacy
  // policy. Amazon's Solution Provider review checks the organisation name on
  // the profile against the website, and "Ampplify Academy" alone gives a
  // reviewer nothing to match "Rakiza Company LTD" to.
  if (copyright) copyright.textContent = `© ${new Date().getFullYear()} Ampplify Academy — a trading name of Rakiza Company LTD. Registered office: 128 City Road, London, EC1V 2NX, United Kingdom. All rights reserved.`;
  renderSocialNav(social, 'footerSocial');
}

// Video testimonials appear on course.html and on success-stories.html, so the
// card markup lives here instead of being copied into both pages.
function videoReviewCards(list) {
  return (list || []).map(v => `
    <div class="video-review-card">
      <div class="video-review-frame"><iframe src="${fbVideoEmbedUrl(v.videoUrl)}" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe></div>
      ${v.name ? `<div class="video-review-name">${v.name}</div>` : ''}
    </div>`).join('');
}

function fbVideoEmbedUrl(videoUrl) {
  const raw = (videoUrl || '').trim();
  // Pasted a full <iframe> embed snippet (from Facebook's "Embed Video"/"Embed Post" option) — pull the real src out of it.
  const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
  let href = iframeMatch ? iframeMatch[1].replace(/&amp;/g, '&') : raw;
  // Already a Facebook plugin embed URL (video.php or post.php) — pull the original permalink
  // back out of its href param so we can re-normalize it below.
  if (/facebook\.com\/plugins\//i.test(href)) {
    try {
      const inner = new URL(href).searchParams.get('href');
      if (inner) href = inner;
    } catch (e) {}
  }
  // A true video/reel permalink has its own player with no caption — video.php renders it clean.
  // A /posts/ permalink (video shared as part of a normal post, no standalone video URL) only
  // works through post.php, which always shows the poster's name/caption/hashtags — Facebook
  // gives no way to suppress that for post.php, so this is a platform limitation, not a bug.
  const isDirectVideo = /facebook\.com\/(?:[^/]+\/videos\/|watch\/?\?|reel\/)/i.test(href);
  const plugin = isDirectVideo ? 'video.php' : 'post.php';
  return 'https://www.facebook.com/plugins/' + plugin + '?href=' + encodeURIComponent(href) + '&show_text=false';
}

// Instant mobile push alerts via ntfy.sh (free, no backend). Install the ntfy
// app (Android/iOS) and subscribe to this exact topic name to get notified.
// ntfy topics are public: anyone who reads this file can subscribe and read
// every message. So an alert only says that something happened - never a
// name, email, phone number or amount. The details are in the admin panel.
const ADMIN_ALERT_TOPIC = 'ampplify-alerts-5b75e40ddfb0';
function sendAdminAlert(title, message) {
  fetch('https://ntfy.sh/' + ADMIN_ALERT_TOPIC, {
    method: 'POST',
    headers: { 'Title': title, 'Priority': 'high' },
    body: message
  }).catch(() => {});
}
