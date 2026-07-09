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
      if (!data.course || !data.course.curriculumTopics || !data.course.curriculumTopics.length) {
        merged.course.curriculumTopics = SITE_CONTENT_DEFAULTS.course.curriculumTopics;
      }
      if (!data.course || !data.course.testimonials || !data.course.testimonials.length) {
        merged.course.testimonials = SITE_CONTENT_DEFAULTS.course.testimonials;
      }
      if (!data.course || !data.course.faqs || !data.course.faqs.length) {
        merged.course.faqs = SITE_CONTENT_DEFAULTS.course.faqs;
      }
      applySiteTheme(merged.theme);
      return merged;
    })
    .catch(() => {
      applySiteTheme(SITE_CONTENT_DEFAULTS.theme);
      return SITE_CONTENT_DEFAULTS;
    });
}
