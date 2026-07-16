function driveImgUrl(url) {
  if (!url) return url;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}

const SITE_CONTENT_DEFAULTS = {
  theme: { accent: '#00b5fe', accentOrange: '#fd7d01', bg: '#0b0e1a' },
  social: { facebook: '', instagram: '' },
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
    currency: 'SAR',
    mentorName: 'Yasin Arafat',
    mentorBio: "I've spent the last 6 years selling on Amazon full-time. This course is everything I wish someone had handed me on day one — no fluff, just what actually works.",
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
    tools: [],
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
      if (!data.course || !data.course.testimonials || !data.course.testimonials.length) {
        merged.course.testimonials = SITE_CONTENT_DEFAULTS.course.testimonials;
      }
      if (!data.course || !data.course.faqs || !data.course.faqs.length) {
        merged.course.faqs = SITE_CONTENT_DEFAULTS.course.faqs;
      }
      if (!data.course || !data.course.services || !data.course.services.length) {
        merged.course.services = SITE_CONTENT_DEFAULTS.course.services;
      }
      if (!data.course || !data.course.successStories || !data.course.successStories.length) {
        merged.course.successStories = SITE_CONTENT_DEFAULTS.course.successStories;
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
  instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>'
};

function renderSocialFooter(social, elId) {
  const el = document.getElementById(elId || 'socialFooter');
  if (!el) return;
  const links = [];
  if (social && social.facebook) links.push(`<a href="${social.facebook}" target="_blank" aria-label="Facebook">${SOCIAL_ICONS.facebook} Facebook</a>`);
  if (social && social.instagram) links.push(`<a href="${social.instagram}" target="_blank" aria-label="Instagram">${SOCIAL_ICONS.instagram} Instagram</a>`);
  el.innerHTML = links.join('');
  el.style.display = links.length ? 'flex' : 'none';
}

function fbVideoEmbedUrl(videoUrl) {
  return 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(videoUrl) + '&show_text=false';
}
