// ─── Terms of Service Data ────────────────────────────────────
// Bilingual content for the Terms of Service page
// Hebrew version follows Israeli Consumer Protection Law
// English version follows general international standards

const termsData = {
  hebrew: {
    title: "תקנון ומדיניות החנות",
    updated: "עודכן לאחרונה",
    sections: [
      {
        heading: "כללי",
        content:
          'ברוכים הבאים לחנות "דה קונטיינר". החנות עוסקת במכירת פריטי אמנות קרמית ואופנה יוקרתית. השימוש באתר ורכישת מוצרים כפופים לתנאי השימוש המפורטים להלן.',
      },
      {
        heading: "הזמנות ותשלום",
        content:
          "כל הזמנה כפופה לאישור ולזמינות המלאי. התשלום מתבצע בעת ביצוע ההזמנה. במקרה של מוצר שאינו במלאי לאחר ביצוע ההזמנה, תינתן לך החזר מלא.",
      },
      {
        heading: "מדיניות ביטול והחזרות",
        content:
          'בהתאם לחוק הגנת הצרכן, התשמ"א-1981, ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010:',
        list: [
          "ניתן לבטל עסקה תוך 14 ימים מיום קבלת המוצר, ללא עלות ביטול.",
          "המוצר חייב להיות לא פגום, לא שומש, ולא ניזוק.",
          "ערך הקנייה חייב לעלות על ₪50.",
          "אנשים עם מוגבלות, בני 65 ומעלה, ועולים חדשים — רשאים לבטל תוך 4 חודשים מיום קבלת המוצר.",
          "ההחזר הכספי יבוצע תוך 14 ימים מיום קבלת הודעת הביטול.",
        ],
        subsections: [
          {
            heading: "מוצרים שלא ניתן להחזיר",
            list: ["מוצרים בהזמנה אישית.", "מוצרים ללא תווית מקורית."],
          },
          {
            heading: "כיצד לבטל עסקה",
            content: "ניתן לשלוח הודעת ביטול באחת מהדרכים הבאות:",
            list: [
              "אימייל: thecontaineronline@gmail.com",
              "טלפון: 055-3000357",
            ],
            note: "יש לציין בהודעת הביטול: שם מלא, מספר הזמנה, וסיבת הביטול.",
          },
        ],
      },
      {
        heading: "משלוחים",
        list: [
          "זמן אספקה: עד 7 ימי עסקים מרגע אישור ההזמנה.",
          "בזמן חירום — השירות מוגבל לאזור המרכז.",
          "עלות המשלוח תוצג בעת התשלום.",
        ],
      },
      {
        heading: "צור קשר",
        content: "לכל שאלה או פנייה:",
        list: [
          "אימייל: thecontaineronline@gmail.com",
          "טלפון: 055-3000357",
          "כתובת: המוריה 61, מושב תנובות, ישראל",
        ],
      },
    ],
  },

  english: {
    title: "Terms of Service",
    updated: "Last updated",
    sections: [
      {
        heading: "General",
        content:
          "Welcome to The Container. We sell handmade ceramic art and luxury fashion items. By using this site and purchasing products, you agree to the terms below.",
      },
      {
        heading: "Orders and Payment",
        content:
          "All orders are subject to availability and confirmation. Payment is processed at the time of order. If an item becomes unavailable after your order, you will receive a full refund.",
      },
      {
        heading: "Cancellation and Returns Policy",
        content:
          "In accordance with the Israeli Consumer Protection Law (1981) and Consumer Protection Regulations (Cancellation of Transaction) 2010:",
        list: [
          "You may cancel an order within 14 days of receiving the product, free of charge.",
          "The item must be unused, undamaged, and in its original condition.",
          "The purchase value must exceed ₪50.",
          "Persons with disabilities, those aged 65 and above, and new immigrants may cancel within 4 months of receiving the product.",
          "Refunds will be issued within 14 days of receiving the cancellation notice.",
        ],
        subsections: [
          {
            heading: "Non-Returnable Items",
            list: [
              "Custom or personalized orders.",
              "Items without their original tag.",
            ],
          },
          {
            heading: "How to Cancel",
            content: "Send your cancellation notice via one of the following:",
            list: ["Email: thecontaineronline@gmail.com", "Phone: 055-3000357"],
            note: "Please include your full name, order number, and reason for cancellation.",
          },
        ],
      },
      {
        heading: "Shipping",
        list: [
          "Delivery time: up to 7 business days from order confirmation.",
          "During emergency situations — service is limited to the central region of Israel.",
          "Shipping costs will be displayed at checkout.",
        ],
      },
      {
        heading: "Contact Us",
        content: "For any questions or requests:",
        list: [
          "Email: thecontaineronline@gmail.com",
          "Phone: 055-3000357",
          "Address: Hamoria 61, Tnuvot, Israel",
        ],
      },
    ],
  },
};

export default termsData;
