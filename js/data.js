// ==========================================================================
// מאגר נתונים עשיר עבור: "טיולי נפתלברג - מה בסביבה"
// כולל תיקיות ברירת מחדל, נקודות ציון מובילות, אטרקציות, שירותים ומקומות
// ==========================================================================

const DEFAULT_FOLDERS = [
  {
    id: 'folder-rome',
    name: 'רומא הקלאסית',
    city: 'רומא, איטליה',
    hotelName: 'Hotel Quirinale Rome',
    hotelAddress: 'Via Nazionale 7, 00184 Roma, Italy',
    hotelLat: 41.9018,
    hotelLng: 12.4938,
    hotelNotes: 'מלון היסטורי סמוך לבית האופרה, ארוחת בוקר בגינה הפנימית, קוד כניסה ללילה: 4421',
    coverGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    icon: '🏛️',
    centerLat: 41.8902,
    centerLng: 12.4922,
    currentHotspotId: 'rome-colosseum'
  },
  {
    id: 'folder-paris',
    name: 'סופ״ש קסום בפריז',
    city: 'פריז, צרפת',
    hotelName: 'Hotel Le Relais Saint-Germain',
    hotelAddress: '9 Carrefour de l\'Odéon, 75006 Paris, France',
    hotelLat: 48.8522,
    hotelLng: 2.3387,
    hotelNotes: 'מלון בוטיק ברובע הלטיני, קרוב למטרו Odéon, כולל קפה ומאפים חופשיים בלובי',
    coverGradient: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)',
    icon: '🗼',
    centerLat: 48.8584,
    centerLng: 2.2945,
    currentHotspotId: 'paris-eiffel'
  },
  {
    id: 'folder-barcelona',
    name: 'ברצלונה עם המשפחה',
    city: 'ברצלונה, ספרד',
    hotelName: 'Hotel Jazz Barcelona',
    hotelAddress: 'Carrer de Pelai 3, 08001 Barcelona, Spain',
    hotelLat: 41.3860,
    hotelLng: 2.1678,
    hotelNotes: 'סמוך לכיכר קטלוניה ולרמבלס, בריכת גג ונוף לעיר, תחנת מטרו Universitat',
    coverGradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    icon: '🎨',
    centerLat: 41.4036,
    centerLng: 2.1744,
    currentHotspotId: 'bcn-sagrada'
  },
  {
    id: 'folder-telaviv',
    name: 'חופשה עירונית בתל אביב',
    city: 'תל אביב, ישראל',
    hotelName: 'The Norman Tel Aviv',
    hotelAddress: 'רחוב נחמני 23-25, תל אביב-יפו',
    hotelLat: 32.0635,
    hotelLng: 34.7749,
    hotelNotes: 'מלון יוקרה בסגנון באוהאוס, קרוב לשדרות רוטשילד ושוק לוינסקי, מסעדת אלנה בחצר',
    coverGradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
    icon: '🌊',
    centerLat: 32.0838,
    centerLng: 34.7675,
    currentHotspotId: 'tlv-beach'
  }
];

// מאגר נקודות ציון מובילות עם מידע עמוק למודל "איפה אני נמצא"
const HOTSPOTS_DATA = {
  'rome-colosseum': {
    id: 'rome-colosseum',
    city: 'רומא',
    name: 'הקולוסיאום (Colosseo)',
    subtitle: 'אמפיתיאטרון פלביוס העתיק - פלא תבל',
    lat: 41.8902,
    lng: 12.4922,
    category: 'attraction',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    details: 'האמפיתיאטרון הגדול ביותר שנבנה אי פעם בעולם העתיק. נחנך בשנת 80 לספירה על ידי הקיסר טיטוס והכיל מעל 50,000 צופים שהריעו לקרבות גלדיאטורים, ציד חיות טרף ומופעי ענק.',
    interestingStories: [
      'קרבות ימיים באצטדיון (Naumachia): בשנותיו הראשונות ניתן היה להציף את רחבת הזירה במיליוני ליטרים של מים כדי לשחזר קרבות ספינות מלחמה עתיקים מול עשרות אלפי צופים נדהמים!',
      'המעלית הסודית: מתחת לזירה פעל מנגנון מורכב של גלגלות, משקולות ו-28 מעליות עץ שהעלו חיות פרא וגלדיאטורים בהפתעה ישירות למרכז הזירה.',
      'מקור השם: השם "קולוסיאום" כלל לא היה שמו המקורי, אלא ניתן לו בשל פסל ברונזה ענקי ("קולוסוס") של הקיסר נירון שניצב בסמוך.'
    ],
    guideWhatToDo: [
      'הגיעו לשער הגלדיאטורים: התצפית הפנורמית הטובה ביותר על הזירה התחתונה (Hypogeum) היא מהקומה השנייה לכיוון שער המוות המזרחי.',
      'נקודת הצילום המושלמת: הצטלמו מהגבעה שמעבר לכביש (Via Nicola Salvi) מעל תחנת המטרו, שם תקבלו את הקולוסיאום כולו ללא קהל ברקע.',
      'חיסכון בתור: כרטיס הכניסה כולל גם את הפורום הרומי וגבעת הפלטין. כדאי להתחיל מהכניסה לפלטין שבה התור קצר בהרבה!'
    ],
    ticketPrice: {
      standard: '18 € (כולל פורום ופלטין)',
      reduced: '4 € (אירופאים בגילאי 18-25)',
      free: 'חינם לילדים מתחת לגיל 18 ולכל המבקרים ביום ראשון הראשון בכל חודש',
      audioGuide: 'תוספת 5.50 €'
    },
    // שעות פתיחה לפי ימים (0 = ראשון, 1 = שני... 6 = שבת)
    schedule: {
      0: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      1: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      2: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      3: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      4: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      5: { open: '08:30', close: '19:15', label: '08:30 - 19:15' },
      6: { open: '08:30', close: '19:15', label: '08:30 - 19:15' }
    },
    showsAndEvents: [
      { time: '17:00', title: 'סיור מודרך אל תת-הקרקע (Hypogeum)', desc: 'ירידה למערך המנהרות שמתחת לזירה וצפייה במתקני ההרמה המשוחזרים.' },
      { time: '18:15', title: 'שעת הזהב: תצפית שקיעה פנורמית', desc: 'השעה שבה השמש הרומית צובעת את קשתות האבן בגוון זהב עוצר נשימה.' },
      { time: '20:30', title: 'מופע תאורת לילה מרהיב (Luna sul Colosseo)', desc: 'תאורת לד היסטורית המאירה את שלוש קומות הקשתות מבפנים ומבחוץ.' }
    ],
    officialUrl: 'https://colosseo.it/en/',
    nearbyPlaces: [
      {
        id: 'r1',
        category: 'restaurant',
        name: 'Ristoro della Salute',
        desc: 'פסטה קרבונרה וקאצ\'יו א פפה אותנטית עם נוף ישיר לקשתות הקולוסיאום',
        cuisine: 'איטלקי רומאי',
        rating: 4.6,
        priceLevel: '€€',
        distanceMeters: 140,
        lat: 41.8912,
        lng: 12.4915,
        address: 'Piazza del Colosseo 2A',
        hours: '11:30 - 23:00'
      },
      {
        id: 'r2',
        category: 'restaurant',
        name: 'Trattoria Luzzi',
        desc: 'טרטוריה שכונתית ותיקה ורועשת, פיצות מעולות מתנור עצים ומחירים מקומיים',
        cuisine: 'טרטוריה איטלקית',
        rating: 4.7,
        priceLevel: '€',
        distanceMeters: 380,
        lat: 41.8885,
        lng: 12.4965,
        address: 'Via di San Giovanni in Laterano 88',
        hours: '12:00 - 23:30'
      },
      {
        id: 'c1',
        category: 'cafe',
        name: 'Caffè Roma Oppio',
        desc: 'אספרסו איטלקי משובח, קפוצ\'ינו קרמי וקרואסון פיסטוק מול הנוף',
        coffeeSpecialty: 'אספרסו קלוי במקום, גראניטה',
        rating: 4.8,
        priceLevel: '€',
        distanceMeters: 190,
        lat: 41.8920,
        lng: 12.4930,
        address: 'Via delle Terme di Tito 72',
        hours: '07:30 - 20:00'
      },
      {
        id: 'c2',
        category: 'cafe',
        name: 'Bar San Clemente',
        desc: 'קפה שכונתי שלווה ליד בזיליקת סן קלמנטה, טירמיסו ביתי מנצח',
        coffeeSpecialty: 'קפה קוריטו, מאפי בוקר',
        rating: 4.5,
        priceLevel: '€',
        distanceMeters: 420,
        lat: 41.8890,
        lng: 12.4980,
        address: 'Piazza di San Clemente',
        hours: '07:00 - 19:30'
      },
      {
        id: 't1',
        category: 'restroom',
        name: 'שירותים ציבוריים - תחנת מטרו Colosseo',
        desc: 'ממוקמים בכניסה למטרו קו B, מתוחזקים על ידי עיריית רומא',
        cost: '1.00 € (במטבעות או באשראי ללא מגע)',
        accessible: 'כן, נגיש לכסאות גלגלים',
        cleanlinessRating: 4.2,
        distanceMeters: 110,
        lat: 41.8915,
        lng: 12.4920,
        hours: '06:00 - 23:30'
      },
      {
        id: 't2',
        category: 'restroom',
        name: 'שירותים ציבוריים - גן קולה די ריינצו',
        desc: 'ביתן שירותים ציבורי אוטומטי ונקי בגן מול הקולוסיאום',
        cost: 'חינם למחזיקי כרטיס Roma Pass, 0.50 € לאחרים',
        accessible: 'כן',
        cleanlinessRating: 4.0,
        distanceMeters: 230,
        lat: 41.8925,
        lng: 12.4910,
        hours: '08:00 - 20:00'
      },
      {
        id: 'e1',
        category: 'essential',
        name: 'בית מרקחת Farmacia Colosseo',
        subType: 'pharmacy',
        desc: 'תרופות, משככי כאבים, עזרה ראשונה ומוצרי הגנה מהשמש',
        rating: 4.6,
        distanceMeters: 260,
        lat: 41.8930,
        lng: 12.4940,
        address: 'Via dei Fori Imperiali 12',
        hours: 'פתוח 08:30 - 20:00'
      },
      {
        id: 'e2',
        category: 'essential',
        name: 'סופרמרקט Carrefour Express',
        subType: 'supermarket',
        desc: 'מים מינרליים קרים, פירות טריים, חטיפים ומוצרי בסיס',
        rating: 4.4,
        distanceMeters: 310,
        lat: 41.8935,
        lng: 12.4955,
        address: 'Via dei Serpenti 135',
        hours: '08:00 - 22:00'
      },
      {
        id: 'e3',
        category: 'essential',
        name: 'כספומט ועמדת המרה Euronet ATM',
        subType: 'atm',
        desc: 'משיכת אירו ישירה מכרטיסי אשראי בינלאומיים',
        rating: 4.1,
        distanceMeters: 150,
        lat: 41.8910,
        lng: 12.4935,
        address: 'Via Celio Vibenna',
        hours: 'פתוח 24/7'
      },
      {
        id: 'e4',
        category: 'essential',
        name: 'תחנת מטרו Colosseo (קו B)',
        subType: 'transit',
        desc: 'גישה ישירה לתחנת הרכבת טרמיני, ולכל חלקי מרכז רומא',
        rating: 4.5,
        distanceMeters: 120,
        lat: 41.8914,
        lng: 12.4925,
        hours: '05:30 - 23:30 (סופ״ש עד 01:30)'
      }
    ]
  },

  'rome-trevi': {
    id: 'rome-trevi',
    city: 'רומא',
    name: 'מזרקת טרווי (Fontana di Trevi)',
    subtitle: 'מזרקת הבארוק הגדולה והמפורסמת ביותר בעולם',
    lat: 41.9009,
    lng: 12.4833,
    category: 'attraction',
    image: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1200&q=80',
    details: 'יצירת מופת דרמטית של הפסל ניקולא סלבי שנחנכה ב-1762. המזרקה מתארת את האל נפטון רוכב על מרכבת צדפה הרתומה לסוסי ים וטריטונים, הניזונה ממי אמת המים הרומית העתיקה אקווה וירגו.',
    interestingStories: [
      '3,000 אירו נאספים מדי לילה: המטיילים משליכים מעל 3,000 אירו בכל יום למי המזרקה! הכסף נאסף בשעות הבוקר המוקדמות על ידי העירייה ונתרם ישירות לארגון הצדקה Caritas כדי לממן מרק חם ודיור לחסרי בית.',
      'חוק שלוש המטבעות: לפי המסורת - מטבע אחד מבטיח שתחזרו לרומא, שני מטבעות מבטיחים רומן רומנטי עם איטלקי/ת, ושלושה מטבעות מבטיחים נישואין מאושרים!',
      'מדוע סלע ענק מסתיר את המספרה? בצד ימין של המזרקה מונח פסל סלע ענקי בצורת כד ("אסו די קופֶּה"). סלבי פיסל אותו במכוון בדיוק מול מספרה מקומית שבעליה הציק לו וביקר את עבודתו מדי יום!'
    ],
    guideWhatToDo: [
      'מסורת השלכת המטבע: עמדו עם הגב למזרקה, החזיקו את המטבע ביד ימין והשליכו אותו מעבר לכתף שמאל.',
      'שעות הקסם: בקרו במזרקה ב-07:00 בבוקר כדי ליהנות מהמקום כמעט לבד, או בחצות כשהמים זוהרים בתאורה דרמטית.',
      'טעימת גלידה סמוכה: גלידריית San Crispino או Il Gelato di San Crispino נמצאות במרחק 3 דקות הליכה.'
    ],
    ticketPrice: {
      standard: 'חינם לחלוטין (אתר ציבורי פתוח תחת כיפת השמיים)',
      tours: 'סיור במתחם אמת המים התת-קרקעי (Vicus Caprarius): 4 €'
    },
    schedule: {
      0: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      1: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      2: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      3: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      4: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      5: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' },
      6: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה' }
    },
    showsAndEvents: [
      { time: '18:45', title: 'הדלקת תאורת המים המוזהבת', desc: 'הזרקורים התת-מימיים נדלקים והופכים את מי המזרקה לטורקיז בוהק מול שיש הטרברטין.' },
      { time: '19:30', title: 'מופע כינור ואקוורל בכיכר', desc: 'אמני רחוב ונגני כינור קלאסי מנעימים את האווירה בסמטאות הסמוכות.' },
      { time: '06:00', title: 'איסוף מטבעות המזרקה הלילי', desc: 'טקס יומי מסקרן שבו שואבי מים מיוחדים של עיריית רומא אוספים את תרומות המבקרים.' }
    ],
    officialUrl: 'https://turismoroma.it/en/places/trevi-fountain',
    nearbyPlaces: [
      {
        id: 'rt1',
        category: 'restaurant',
        name: 'Piccolo Arancio',
        desc: 'טרטוריה רומאית חמה וידידותית, רביולי תפוזים ייחודי ובשרים מופלאים',
        cuisine: 'איטלקי מסורתי',
        rating: 4.8,
        priceLevel: '€€',
        distanceMeters: 120,
        lat: 41.9015,
        lng: 12.4842,
        address: 'Vicolo Scanderbeg 112',
        hours: '12:00 - 23:00'
      },
      {
        id: 'rt2',
        category: 'restaurant',
        name: 'Pane e Salame',
        desc: 'לוחות שרקוטרי ענקיים, גבינות פקורינו משובחות וכריכים איטלקיים מעולים',
        cuisine: 'טאפאס איטלקי & יין',
        rating: 4.9,
        priceLevel: '€',
        distanceMeters: 170,
        lat: 41.9004,
        lng: 12.4819,
        address: 'Via di Santa Maria in Via 19',
        hours: '11:00 - 22:30'
      },
      {
        id: 'ct1',
        category: 'cafe',
        name: 'Antico Caffè Castellino',
        desc: 'קפה אספרסו חזק, קנולי סיציליאני טרי וגלידה משובחת',
        coffeeSpecialty: 'קפוצ\'ינו אומנותי וקנולי',
        rating: 4.6,
        priceLevel: '€',
        distanceMeters: 80,
        lat: 41.9011,
        lng: 12.4837,
        address: 'Piazza di Trevi 94',
        hours: '08:00 - 00:00'
      },
      {
        id: 'tt1',
        category: 'restroom',
        name: 'שירותים ציבוריים - סמטת Vicolo del Forno',
        desc: 'שירותים ציבוריים חדישים ומבוקרים על ידי העירייה',
        cost: '1.00 €',
        accessible: 'כן',
        cleanlinessRating: 4.4,
        distanceMeters: 95,
        lat: 41.9006,
        lng: 12.4839,
        hours: '08:00 - 21:00'
      },
      {
        id: 'et1',
        category: 'essential',
        name: 'בית מרקחת Farmacia Trevi',
        subType: 'pharmacy',
        desc: 'בית מרקחת שירותי עם צוות דובר אנגלית, עזרה ראשונה',
        rating: 4.5,
        distanceMeters: 130,
        lat: 41.9014,
        lng: 12.4828,
        address: 'Via del Lavatore 92',
        hours: '08:30 - 20:30'
      },
      {
        id: 'et2',
        category: 'essential',
        name: 'מינימרקט Conad City',
        subType: 'supermarket',
        desc: 'סופרמרקט מלא למצרכים, שתייה קרה ופירות',
        rating: 4.4,
        distanceMeters: 220,
        lat: 41.9022,
        lng: 12.4845,
        address: 'Via del Boccaccio 18',
        hours: '08:00 - 21:30'
      }
    ]
  },

  'paris-eiffel': {
    id: 'paris-eiffel',
    city: 'פריז',
    name: 'מגדל אייפל (Tour Eiffel)',
    subtitle: 'גבירת הברזל של פריז והמונומנט המפורסם בתבל',
    lat: 48.8584,
    lng: 2.2945,
    category: 'attraction',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    details: 'נבנה על ידי גוסטב אייפל עבור התערוכה העולמית של 1889 לציון 100 שנה למהפכה הצרפתית. גובהו 330 מטרים והוא היה המבנה הגבוה בעולם במשך 41 שנים. שוקל 10,100 טונות של ברזל יצוק ומורכב מ-2.5 מיליון מסמרות.',
    interestingStories: [
      'המגדל שכמעט נהרס: עיריית פריז תכננה לפרק את המגדל כעבור 20 שנה (ב-1909), אך הוא ניצל ברגע האחרון לאחר שגוסטב אייפל הוכיח את ערכו הצבאי והתקשורתי כאנטנת שידור ורדיו טלגרפיה!',
      'צומח ומתכווץ בעונות השנה: בגלל תכונות ההתפשטות התרמית של הברזל, מגדל אייפל גובה בקיץ בעד 15 סנטימטרים ונוטה מעט הרחק מהשמש, ובחורף מתכווץ בחזרה.',
      'הדירה הסודית בראש המגדל: לגוסטב אייפל הייתה דירה פרטית קטנה בקומה העליונה ביותר, שבה אירח אורחים רמי מעלה כגון תומאס אדיסון. כיום ניתן להציץ לתוכה דרך חלון תצוגה.'
    ],
    guideWhatToDo: [
      'השעה הטובה ביותר: עלו חצי שעה לפני השקיעה - כך תזכו לראות את פריז באור יום, לצפות בשקיעה מעל נהר הסן, ולראות את העיר נדלקת באלפי אורות.',
      'מופע הנצנוצים המפורסם: בכל שעה עגולה מרדת החשיכה ועד 23:00, המגדל מנצנץ ב-20,000 נורות זוהרות במשך בדיוק 5 דקות.',
      'התצפית המושלמת לצילום: גשו לטיילת טרוקדרו (Place du Trocadéro) שמעבר לנהר או למדשאות שאן דה מארס (Champ de Mars) לפיקניק מושלם.'
    ],
    ticketPrice: {
      standard: '29.40 € (כרטיס מעלית לפסגה)',
      stairsTo2nd: '11.80 € (עליה במדרגות עד קומה שנייה - חוויה ספורטיבית מומלצת!)',
      children: '7.40 € (גילאי 4-11)',
      toddler: 'חינם (מתחת לגיל 4)'
    },
    schedule: {
      0: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      1: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      2: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      3: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      4: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      5: { open: '09:00', close: '23:45', label: '09:00 - 23:45' },
      6: { open: '09:00', close: '23:45', label: '09:00 - 23:45' }
    },
    showsAndEvents: [
      { time: '20:00', title: 'מופע נצנוצי הזהב הראשון הערב', desc: '5 דקות של הבהובי אורות מרהיבים שמרעידים את שמי פריז.' },
      { time: '21:00', title: 'מופע נצנוצי זהב שני', desc: 'מופע האורות השעתי המופעל בדיוק עם השעה העגולה.' },
      { time: '22:00', title: 'מופע אורות וקרן לייזר מסתובבת', desc: 'קרן הלייזר בראש המגדל סורקת את פריז עד לטווח של 80 ק"מ.' }
    ],
    officialUrl: 'https://www.toureiffel.paris/en',
    nearbyPlaces: [
      {
        id: 'pe-r1',
        category: 'restaurant',
        name: 'Café de l\'Homme',
        desc: 'מסעדת בראסרי יוקרתית בטרוקדרו עם מרפסת מדהימה ומבט ישיר למגדל',
        cuisine: 'גורמה צרפתי',
        rating: 4.7,
        priceLevel: '€€€',
        distanceMeters: 450,
        lat: 48.8624,
        lng: 2.2882,
        address: '17 Place du Trocadéro',
        hours: '12:00 - 02:00'
      },
      {
        id: 'pe-r2',
        category: 'restaurant',
        name: 'Le Bistro Parisien',
        desc: 'ביסטרו נעים היושב על גדות נהר הסן למרגלות המגדל',
        cuisine: 'ביסטרו צרפתי קלאסי',
        rating: 4.4,
        priceLevel: '€€',
        distanceMeters: 220,
        lat: 48.8596,
        lng: 2.2965,
        address: 'Port de la Bourdonnais',
        hours: '11:00 - 23:00'
      },
      {
        id: 'pe-c1',
        category: 'cafe',
        name: 'Caretté Trocadéro',
        desc: 'השוקו החם המפורסם ביותר בפריז עם קצפת שאנטילי ביתית ומקרונים משובחים',
        coffeeSpecialty: 'שוקולד חם סמיך מסורתי',
        rating: 4.8,
        priceLevel: '€€',
        distanceMeters: 550,
        lat: 48.8630,
        lng: 2.2870,
        address: '4 Place du Trocadéro',
        hours: '07:00 - 23:30'
      },
      {
        id: 'pe-t1',
        category: 'restroom',
        name: 'שירותים ציבוריים - עמדת שאן דה מארס',
        desc: 'תא שירותים עירוני מתקדם מנקה אוטומטית (Sanisette de Paris)',
        cost: 'חינם (שירות עיריית פריז ללא תשלום)',
        accessible: 'כן, נגיש ומרווח',
        cleanlinessRating: 4.3,
        distanceMeters: 180,
        lat: 48.8572,
        lng: 2.2960,
        hours: 'פתוח 24/7'
      },
      {
        id: 'pe-e1',
        category: 'essential',
        name: 'תחנת RER ורכבת Champ de Mars - Tour Eiffel',
        subType: 'transit',
        desc: 'קו C של הרכבת הפרברית לורסאי, מוזיאון ד\'אורסיי ונוטרדאם',
        rating: 4.5,
        distanceMeters: 320,
        lat: 48.8550,
        lng: 2.2890,
        hours: '05:00 - 00:30'
      },
      {
        id: 'pe-e2',
        category: 'essential',
        name: 'בית מרקחת Pharmacie de la Tour Eiffel',
        subType: 'pharmacy',
        desc: 'תרופות, מוצרי דרמו-קוסמטיקה צרפתיים וייעוץ רפואי',
        rating: 4.6,
        distanceMeters: 380,
        lat: 48.8555,
        lng: 2.2995,
        address: '29 Avenue de la Bourdonnais',
        hours: '08:00 - 20:00'
      }
    ]
  },

  'bcn-sagrada': {
    id: 'bcn-sagrada',
    city: 'ברצלונה',
    name: 'סגרדה פמיליה (Basílica de la Sagrada Família)',
    subtitle: 'יצירת המופת הבלתי נגמרת של אנטוני גאודי',
    lat: 41.4036,
    lng: 2.1744,
    category: 'attraction',
    image: 'https://images.unsplash.com/photo-1583779457094-0cef1bad8b5d?auto=format&fit=crop&w=1200&q=80',
    details: 'בזיליקה מרהיבה שעיצובה שואב השראה מעולם הטבע, היערות והאור. בנייתה החלה בשנת 1882 וצפויה להסתיים סופית בשנת 2026, 100 שנה לאחר מותו של גאודי.',
    interestingStories: [
      'היער של אבן ואור: עמודי התווך של הכנסייה עוצבו כעצי ענק המסתעפים לצמרות, וחלונות הויטראז\' הצבעוניים מתוכננים כך שבבוקר נכנס אור כחול-ירוק מרגיע, ואילו בשעות אחר הצהריים הכנסייה מוצפת בכתום-אדום לוהט!',
      'ריבוע הקסם המסתורי: על חזית הפסיון חקוק ריבוע עם 16 מספרים. חיבור המספרים בכל שורה, טור ואלכסון מסתכם תמיד במספר 33 - גילו של ישו במותו.',
      'קבר גאודי: גאודי עצמו, שנדרס על ידי חשמלית ב-1926 בעודו הולך שקוע במחשבות, קבור בקריפטה התת-קרקעית של הבזיליקה.'
    ],
    guideWhatToDo: [
      'שעות חלונות הויטראז\': הזמינו כרטיס בין 16:00 ל-18:00 - זהו הזמן המושלם שבו השמש המערבית מציפה את הבזיליקה בצבעים מרהיבים.',
      'תצפית מהמגדלים: אם אינכם סובלים מפחד גבהים, מגדל חזית המולד (Nativity Tower) מציע תצפית עוצרת נשימה וירידה במדרגות לולייניות מרהיבות.',
      'הצילום הקלאסי מהאגם: צאו לפארק שממזרח (Plaça de Gaudí), עמדו ליד האגם הקטן וצלמו את השתקפות המגדלים במים!'
    ],
    ticketPrice: {
      standard: '26.00 € (כולל מדריך קולי באפליקציה)',
      withTowers: '36.00 € (כולל עליה למגדלי התצפית)',
      students: '24.00 €',
      under11: 'חינם'
    },
    schedule: {
      0: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      1: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      2: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      3: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      4: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      5: { open: '09:00', close: '20:00', label: '09:00 - 20:00' },
      6: { open: '09:00', close: '20:00', label: '09:00 - 20:00' }
    },
    showsAndEvents: [
      { time: '16:30', title: 'מופע קרני השמש בחלונות הזכוכית', desc: 'השתקפויות הצבעים מגיעות לשיאן על קירות השיש הלבנים.' },
      { time: '18:00', title: 'מיסה בינלאומית ומוזיקת עוגב', desc: 'תפילה חגיגית מלווה בצלילי עוגב כנסייתי ענק ואקוסטיקה פנומנלית.' },
      { time: '19:15', title: 'צלצול פעמוני המגדלים לקראת שקיעה', desc: 'שיר הלל של הפעמונים ההיסטוריים שנשמע ברחבי רובע אישמפלה.' }
    ],
    officialUrl: 'https://sagradafamilia.org/en/',
    nearbyPlaces: [
      {
        id: 'bs-r1',
        category: 'restaurant',
        name: 'La Taqueria',
        desc: 'טאקו מקסיקני אותנטי ושוקק סמוך לבזיליקה, מושלם לצהריים קלים',
        cuisine: 'אוכל רחוב מקסיקני',
        rating: 4.7,
        priceLevel: '€',
        distanceMeters: 180,
        lat: 41.4045,
        lng: 2.1755,
        address: 'Carrer de Passatge de Simó 8',
        hours: '13:00 - 23:30'
      },
      {
        id: 'bs-r2',
        category: 'restaurant',
        name: 'El Celler de Gaudí',
        desc: 'פאייה פירות ים מסורתית, טאפאס ספרדי קטלוני וסנגרייה קרה',
        cuisine: 'ספרדי & פאייה',
        rating: 4.5,
        priceLevel: '€€',
        distanceMeters: 240,
        lat: 41.4020,
        lng: 2.1730,
        address: 'Carrer de Provença 400',
        hours: '12:00 - 23:00'
      },
      {
        id: 'bs-c1',
        category: 'cafe',
        name: 'Café de la Sagrada',
        desc: 'צ\'ורוס חם וטרי טבול בשוקולד סמיך, קורטאדו ספרדי מעולה',
        coffeeSpecialty: 'קורטאדו ספרדי, צ\'ורוס טרי',
        rating: 4.8,
        priceLevel: '€',
        distanceMeters: 110,
        lat: 41.4030,
        lng: 2.1735,
        address: 'Plaça de la Sagrada Família 1',
        hours: '08:00 - 21:00'
      },
      {
        id: 'bs-t1',
        category: 'restroom',
        name: 'שירותים ציבוריים - גן פלאסה דה גאודי',
        desc: 'ביתן שירותים אוטומטי ונקי בפארק מול חזית המולד',
        cost: 'חינם',
        accessible: 'כן',
        cleanlinessRating: 4.5,
        distanceMeters: 130,
        lat: 41.4040,
        lng: 2.1758,
        hours: '07:30 - 21:30'
      },
      {
        id: 'bs-e1',
        category: 'essential',
        name: 'תחנת מטרו Sagrada Família (קווים L2 ו-L5)',
        subType: 'transit',
        desc: 'תחנה מרכזית מהירה לפסאז\' דה גראסיה ולכיכר קטלוניה',
        rating: 4.6,
        distanceMeters: 90,
        lat: 41.4032,
        lng: 2.1738,
        hours: '05:00 - 00:00'
      }
    ]
  },

  'tlv-beach': {
    id: 'tlv-beach',
    city: 'תל אביב',
    name: 'טיילת תל אביב וחוף גורדון',
    subtitle: 'רצועת החוף התוססת, הדופק האמיתי של העיר הלבנה',
    lat: 32.0838,
    lng: 34.7675,
    category: 'attraction',
    image: 'https://images.unsplash.com/photo-1544971587-b842c27f8e14?auto=format&fit=crop&w=1200&q=80',
    details: 'טיילת שלווה ושוקקת חיים המשתרעת מנמל תל אביב ועד ליפו העתיקה. מציעה חופי רחצה עם מים צלולים, בריכת מי ים היסטורית, מסעדות דגים על המים וטיילת אופניים והליכה מהיפות במזרח התיכון.',
    interestingStories: [
      'מולדת המטקות: חוף גורדון וחוף בוגרשוב נחשבים למולדת משחק המטקות הישראלי החל משנות ה-50 של המאה ה-20! צליל הנקישות של הכדור הוא חלק בלתי נפרד מהפסקול המקומי.',
      'בריכת גורדון המיתולוגית: בריכת השחייה הראשונה שנפתחה ב-1956 הוזנה במי תהום מלוחים שנשאבו מעומק 150 מטר מתחת לאדמה בטמפרטורה קבועה של 24 מעלות כל השנה.',
      'שקיעות הים התיכון: תל אביב נבחרה לא פעם לאחת מ-10 ערי החוף הטובות בעולם על ידי מגזין National Geographic בזכות רצועת השקיעות הבלתי נשכחת שלה.'
    ],
    guideWhatToDo: [
      'השעה הטובה ביותר: לקראת 18:00 - שבו בכיסאות הנוח על קו המים, הזמינו בירה קרה או אבטיח עם גבינה בולגרית, וצפו בשקיעה.',
      'הליכה רומנטית ליפו: לכו דרומה לאורך הטיילת בשעות בין הערביים (כ-35 דקות הליכה נעימה) עד לנמל יפו.',
      'שירותי חוף נוחים: ניתן לשכור כיסאות, מיטות שיזוף ושמשיות במחיר עירוני מסובסד באפליקציית דיגיתל או בעמדות האוטומטיות.'
    ],
    ticketPrice: {
      standard: 'חינם לחלוטין (חופי רחצה פתוחים לקהל)',
      beachGear: 'כיסא חוף: 6 ₪ | מיטת שיזוף: 12 ₪ | שמשייה: 6 ₪ (לתושבי תל אביב הנחות בדיגיתל)',
      gordonPool: 'כניסה לבריכת גורדון: 69 ₪'
    },
    schedule: {
      0: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      1: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      2: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      3: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      4: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      5: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' },
      6: { open: '00:00', close: '23:59', label: 'פתוח 24 שעות ביממה (שירותי הצלה עד 18:00)' }
    },
    showsAndEvents: [
      { time: '17:30', title: 'מעגלי ריקודי עם ישראליים בטיילת', desc: 'מסורת תל אביבית ססגונית ברחבת הטיילת של חוף גורדון בהשתתפות מאות רוקדים.' },
      { time: '18:45', title: 'שעת השקיעה ומוזיקה חיה בלאונג\'', desc: 'דיג\'יי מקומי עם מוזיקת צ\'ילאאוט שקיעה במסעדות קו החוף.' },
      { time: '20:00', title: 'יוגה ואימון ערב מול הים', desc: 'אימון פתוח ברחבת הדק מול המרינה.' }
    ],
    officialUrl: 'https://www.visit-telaviv.com',
    nearbyPlaces: [
      {
        id: 'tlv-r1',
        category: 'restaurant',
        name: 'גרקו (Greco Beach)',
        desc: 'טברנה יוונית על החוף, מזאטים טריים, גירוס וצזיקי בליווי אוזו קר',
        cuisine: 'יווני ים-תיכוני',
        rating: 4.7,
        priceLevel: '₪₪₪',
        distanceMeters: 110,
        lat: 32.0845,
        lng: 34.7680,
        address: 'רציף הרברט סמואל / חוף גורדון',
        hours: '12:00 - 00:00'
      },
      {
        id: 'tlv-r2',
        category: 'restaurant',
        name: 'ברבוניה',
        desc: 'מוסד דגים תל אביבי מיתולוגי, דגים טריים מטוגנים על המקום וסלטים עשירים',
        cuisine: 'דגים ומאכלי ים',
        rating: 4.8,
        priceLevel: '₪₪',
        distanceMeters: 380,
        lat: 32.0830,
        lng: 34.7710,
        address: 'רחוב בן יהודה 163',
        hours: '12:00 - 23:30'
      },
      {
        id: 'tlv-c1',
        category: 'cafe',
        name: 'קפה לנדוור חוף בוגרשוב',
        desc: 'קפה קר, שייק אסאי מרענן, ארוחות בוקר עשירות ונוף ישיר לגלים',
        coffeeSpecialty: 'קפה קר עשיר, שייקים טריים',
        rating: 4.6,
        priceLevel: '₪₪',
        distanceMeters: 220,
        lat: 32.0815,
        lng: 34.7670,
        address: 'טיילת בוגרשוב',
        hours: '07:00 - 01:00'
      },
      {
        id: 'tlv-t1',
        category: 'restroom',
        name: 'שירותים ציבוריים ומקלחות חוף גורדון',
        desc: 'מתחם שירותים ומלתחות מרווח של עיריית תל אביב-יפו',
        cost: 'חינם לחלוטין',
        accessible: 'כן, כולל שביל נגישות לקו המים',
        cleanlinessRating: 4.6,
        distanceMeters: 60,
        lat: 32.0835,
        lng: 34.7672,
        hours: '06:00 - 22:00'
      },
      {
        id: 'tlv-e1',
        category: 'essential',
        name: 'סופר פארם בן יהודה',
        subType: 'pharmacy',
        desc: 'בית מרקחת מלא, קרם הגנה, מוצרי תינוקות ועזרה ראשונה',
        rating: 4.6,
        distanceMeters: 290,
        lat: 32.0842,
        lng: 34.7705,
        address: 'רחוב בן יהודה 145',
        hours: '08:00 - 23:00'
      },
      {
        id: 'tlv-e2',
        category: 'essential',
        name: 'עמדת תל-אופן / קורקינטים שיתופיים',
        subType: 'transit',
        desc: 'השכרת אופניים וקורקינטים לרכיבה לאורך כל רצועת הטיילת',
        rating: 4.8,
        distanceMeters: 80,
        lat: 32.0839,
        lng: 34.7679,
        hours: '24/7'
      }
    ]
  }
};

// ייצוא מודול גלובלי
window.NaftalbergData = {
  DEFAULT_FOLDERS,
  HOTSPOTS_DATA
};
