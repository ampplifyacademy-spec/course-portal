const SITE_CONTENT_DEFAULTS = {
  theme: { accent: '#00b5fe', accentOrange: '#fd7d01', bg: '#0b0e1a' },
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
    modules: [
      { title: 'Amazon Seller Account Setup', desc: 'Register your seller account correctly the first time and avoid the common mistakes that get new sellers suspended.', duration: '45 min', lessons: 4, published: true },
      { title: 'Product Research & Sourcing', desc: 'Find profitable products with real demand, validate them with data, and source reliable suppliers.', duration: '1.5 hr', lessons: 6, published: true },
      { title: 'Listing Optimization & SEO', desc: 'Write titles, bullets, and images that rank and convert — using the same keyword process used for real listings.', duration: '1 hr', lessons: 5, published: true },
      { title: 'PPC Advertising Mastery', desc: 'Launch and optimize Sponsored Products campaigns without wasting your ad budget on guesswork.', duration: '2 hr', lessons: 7, published: true },
      { title: 'Inventory & FBA Logistics', desc: 'Plan shipments, avoid stockouts, and manage FBA fees so restocking never catches you off guard.', duration: '1 hr', lessons: 4, published: true },
      { title: 'Scaling to 6-Figures', desc: 'Systems and outsourcing strategies to grow past your first product without working more hours.', duration: '1.5 hr', lessons: 5, published: true }
    ]
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
        landing: Object.assign({}, SITE_CONTENT_DEFAULTS.landing, data.landing || {}),
        course: Object.assign({}, SITE_CONTENT_DEFAULTS.course, data.course || {})
      };
      if (!data.course || !data.course.modules || !data.course.modules.length) {
        merged.course.modules = SITE_CONTENT_DEFAULTS.course.modules;
      }
      applySiteTheme(merged.theme);
      return merged;
    })
    .catch(() => {
      applySiteTheme(SITE_CONTENT_DEFAULTS.theme);
      return SITE_CONTENT_DEFAULTS;
    });
}
