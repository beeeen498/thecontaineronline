// ─── Translations ─────────────────────────────────────────────
// All English and Hebrew text lives here.
// Usage: const t = translations[language.toLowerCase()]
// Then use t.nav.home, t.about.heading, etc.

export const translations = {

  // ─── English ────────────────────────────────────────────────
  english: {

    // ─── Nav ──────────────────────────────────────────────
    nav: {
      home: 'Home',
      about: 'About',
      fashion: 'Fashion',
      art: 'Art',
      info: 'Info',
      contact: 'Contact',
    },

    // ─── Footer ───────────────────────────────────────────
    footer: {
      quickLinks: 'Quick Links',
      followUs: 'Follow Us',
      tagline: 'Art & Fashion',
      copyright: 'The Container. All rights reserved.',
    },

    // ─── About Section ────────────────────────────────────
    about: {
      heading: 'About Us',
      text: "Welcome to 'The Container' where art and fashion meet.\n'The Container' is a unique studio for ceramic art and second-hand luxury brand items, whether previously used or kept in pristine condition. Here, you'll find unique, high-quality items that tell a story of beauty and style.\n\nI am Daniel Kedem, an artist and fashion enthusiast.\nAll of my artworks are handcrafted, utilizing both modern and traditional techniques. Each piece in the studio results from a passion for art, attention to detail, and a love for aesthetics.",
    },

    // ─── Featured Items ───────────────────────────────────
    featuredItems: {
      fashionHeading: 'Featured Fashion Items:',
      artHeading: 'Featured Art Items:',
      fashionText: 'Our fashion collection offers new and second-hand authentic items from leading designers. From wallets, bags, and belts to a selection of shoes every sneakerhead must have in their collection.',
      artText: "Explore our unique, handmade art pieces including vases, cups, ashtrays, plates, and more. Each piece is meticulously crafted with attention to detail and a passion for beauty.",
      buttonText: 'See more',
    },

    // ─── Contact ──────────────────────────────────────────
    contact: {
      heading: 'Contact Us',
      text: "Have more questions? Contact us and we'll get back to you soon!",
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      message: 'Your Message',
      send: 'SEND',
      sent: 'SENT!',
    },

    // ─── Store ────────────────────────────────────────────
    store: {
      noItems: 'No items match the selected filters.',
      filters: {
        category: 'Category',
        brand: 'Brands',
        colors: 'Colors',
        price: 'Price',
        all: 'All',
        multiple: 'Multiple',
        select: 'Select',
      },
    },

    // ─── Item Page ────────────────────────────────────────
    item: {
      moreInfo: 'More Info',
      returnPolicy: 'Return Policy and Shipping',
      careInstructions: 'Care Instructions',
      share: 'Share',
      soldOut: 'Sold Out',
    },

    // ─── Info Page ────────────────────────────────────────
    info: {
      articles: 'Articles',
    },

    // ─── Cookie Consent ───────────────────────────────────
    consent: {
      message: 'We use cookies to understand how visitors use our site and to improve your experience.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Learn More',
    },

    // ─── Error Page ───────────────────────────────────────
    notFound: {
      heading: '404',
      message: 'The page you are looking for does not exist.',
      cta: 'Back to Home',
    },
  },

  // ─── Hebrew ─────────────────────────────────────────────────
  hebrew: {

    // ─── Nav ──────────────────────────────────────────────
    nav: {
      home: 'בית',
      about: 'אודות',
      fashion: 'אופנה',
      art: 'אמנות',
      info: 'מידע',
      contact: 'צור קשר',
    },

    // ─── Footer ───────────────────────────────────────────
    footer: {
      quickLinks: 'ניווט מהיר',
      followUs: 'עקבו אחרינו',
      tagline: 'אמנות ואופנה',
      copyright: 'הקונטיינר. כל הזכויות שמורות.',
    },

    // ─── About Section ────────────────────────────────────
    about: {
      heading: 'קצת עלינו',
      text: "ברוכים הבאים ל׳הקונטיינר׳ המקום שבו אמנות ואופנה נפגשות.\n׳הקונטיינר׳ הוא סטודיו ייחודי לאמנות קרמיקה ופריטי מותגי יוקרה יד שניה. כאן תמצאו פריטים ייחודיים ואיכותיים שמספרים סיפור של יופי וסטייל.\n\nאני דניאל קדם, אמנית וחובבת אופנה.\nכל יצירות האמנות שלי נוצרות בעבודת יד. כל פריט הוא תוצאה של תשוקה לאמנות, תשומת לב לפרטים ואהבה לאסתטיקה.",
    },

    // ─── Featured Items ───────────────────────────────────
    featuredItems: {
      fashionHeading: 'פריטי אופנה נבחרים:',
      artHeading: 'פריטי אמנות נבחרים:',
      fashionText: 'קולקציית האופנה שלנו מציעה פרטים אותנטיים חדשים ויד שניה של מעצבים מובילים.',
      artText: 'פרטי האמנות שלנו יוצרו כולם בעבודת יד וכוללים אגרטלים, כוסות, מאפרות, צלחות ועוד.',
      buttonText: 'עוד מוצרים',
    },

    // ─── Contact ──────────────────────────────────────────
    contact: {
      heading: 'צרו קשר',
      text: 'יש לכם שאלות נוספות? צרו איתנו קשר ונחזור אליכם בהקדם!',
      firstName: 'שם פרטי',
      lastName: 'שם משפחה',
      email: 'אימייל',
      message: 'ההודעה שלך',
      send: 'שלח',
      sent: 'ההודעה נשלחה!',
    },

    // ─── Store ────────────────────────────────────────────
    store: {
      noItems: 'לא נמצאו פריטים שמתאימים לפילטרים שנבחרו.',
      filters: {
        category: 'קטגוריה',
        brand: 'חברה',
        colors: 'צבעים',
        price: 'מחיר',
        all: 'הכל',
        multiple: 'רבים',
        select: 'בחר',
      },
    },

    // ─── Item Page ────────────────────────────────────────
    item: {
      moreInfo: 'מידע נוסף',
      returnPolicy: 'מדיניות החזרה ומשלוחים',
      careInstructions: 'הוראות טיפול',
      share: 'שיתוף',
      soldOut: 'אזל המלאי',
    },

    // ─── Info Page ────────────────────────────────────────
    info: {
      articles: 'מאמרים',
    },

    // ─── Cookie Consent ───────────────────────────────────
    consent: {
      message: 'אנו משתמשים בעוגיות כדי להבין כיצד המבקרים משתמשים באתר ולשפר את החוויה שלכם.',
      accept: 'אישור',
      decline: 'דחייה',
      learnMore: 'מידע נוסף',
    },

    // ─── Error Page ───────────────────────────────────────
    notFound: {
      heading: '404',
      message: 'הדף שאתם מחפשים לא קיים.',
      cta: 'חזרה לדף הבית',
    },
  },
};