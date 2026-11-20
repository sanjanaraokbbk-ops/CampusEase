import {
  BookingStatus,
  CampusService,
  FulfillmentMethod,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ServiceBooking,
  StudentProfile,
} from '../types/campus';

export const HERO_IMAGE = '/src/assets/images/hero_campusease_1795166489342.jpg';

export const PRODUCT_IMAGES = {
  notebooksFiles: '/src/assets/images/prod_notebooks_files_1795166490785.jpg',
  pensHighlighters: '/src/assets/images/prod_pens_highlighters_1795166489513.jpg',
  chipsBiscuits: '/src/assets/images/prod_chips_biscuits_1795166489732.jpg',
  noodlesDrinks: '/src/assets/images/prod_noodles_drinks_1795166493479.jpg',
  shampooSoap: '/src/assets/images/prod_shampoo_soap_1795166491632.jpg',
  skincareHygiene: '/src/assets/images/prod_skincare_hygiene_1795166494904.jpg',
  firstAidBandages: '/src/assets/images/prod_first_aid_bandages_1795166491126.jpg',
  antisepticOtc: '/src/assets/images/prod_antiseptic_otc_1795166490496.jpg',
};

export const CATEGORY_DETAILS: Record<
  ProductCategory,
  {
    summary: string;
    image: string;
    itemHint: string;
  }
> = {
  [ProductCategory.STATIONERY]: {
    summary: 'Notebooks, smooth gel pens, highlighters, assignment files, and sticky notes.',
    image: PRODUCT_IMAGES.notebooksFiles,
    itemHint: 'Notebooks · Pens · Files',
  },
  [ProductCategory.SNACKS]: {
    summary: 'Late-night study chips, biscuits, dark chocolate, instant noodles, and chilled drinks.',
    image: PRODUCT_IMAGES.chipsBiscuits,
    itemHint: 'Chips · Noodles · Drinks',
  },
  [ProductCategory.PERSONAL_CARE]: {
    summary: 'Daily shampoo, gentle soap bars, mint toothpaste, sanitary care, and skincare basics.',
    image: PRODUCT_IMAGES.shampooSoap,
    itemHint: 'Shampoo · Hygiene · Skincare',
  },
  [ProductCategory.MEDICINES]: {
    summary: 'Basic first-aid kits, bandages, topical antiseptics, and permitted OTC campus essentials.',
    image: PRODUCT_IMAGES.firstAidBandages,
    itemHint: 'First Aid · Bandages · OTC Only',
  },
};

export const INITIAL_PRODUCTS: Product[] = [
  // Stationery
  {
    id: 'prod-st-1',
    name: 'A4 Spiral Ruled Notebooks (Pack of 3)',
    category: ProductCategory.STATIONERY,
    price: 145,
    unit: '3 × 180 pages',
    description:
      'Thick 70 GSM bleed-resistant ruled spiral notebooks ideal for semester lecture notes and exam revision.',
    image: PRODUCT_IMAGES.notebooksFiles,
    available: true,
    popular: true,
  },
  {
    id: 'prod-st-2',
    name: 'Smooth Matte Gel Pens (Pack of 5)',
    category: ProductCategory.STATIONERY,
    price: 60,
    unit: '3 Blue · 2 Black · 0.5mm',
    description:
      'Quick-dry waterproof gel ink pens with comfortable matte grip for long written exams and assignments.',
    image: PRODUCT_IMAGES.pensHighlighters,
    available: true,
    popular: true,
  },
  {
    id: 'prod-st-3',
    name: 'Pastel Chisel-Tip Highlighters (Set of 4)',
    category: ProductCategory.STATIONERY,
    price: 110,
    unit: '4 Pastel Shades',
    description:
      'Soft lavender, sky blue, mint, and yellow highlighters that accentuate textbook passages without smudging.',
    image: PRODUCT_IMAGES.pensHighlighters,
    available: true,
  },
  {
    id: 'prod-st-4',
    name: 'Frosted Snap Document Folders (Pack of 2)',
    category: ProductCategory.STATIONERY,
    price: 85,
    unit: 'A4 Water-Resistant',
    description:
      'Durable translucent polypropylene button folders to keep project printouts, admit cards, and lab sheets crisp.',
    image: PRODUCT_IMAGES.notebooksFiles,
    available: true,
  },
  {
    id: 'prod-st-5',
    name: 'Pastel Sticky Notes Cube (300 Sheets)',
    category: ProductCategory.STATIONERY,
    price: 55,
    unit: '3 × 3 inch · 2 Pads',
    description:
      'Repositionable adhesive study tabs for textbook bookmarks, hostel desk reminders, and deadline tracking.',
    image: PRODUCT_IMAGES.notebooksFiles,
    available: true,
  },

  // Snacks & Beverages
  {
    id: 'prod-sn-1',
    name: 'Classic Salted Kettle Chips',
    category: ProductCategory.SNACKS,
    price: 40,
    unit: '90g Resealable Pouch',
    description:
      'Crunchy slow-cooked potato chips lightly seasoned with sea salt—perfect for between-class breaks.',
    image: PRODUCT_IMAGES.chipsBiscuits,
    available: true,
    popular: true,
  },
  {
    id: 'prod-sn-2',
    name: 'Golden Butter Biscuits Combo',
    category: ProductCategory.SNACKS,
    price: 50,
    unit: '2 × 120g Packs',
    description:
      'Crisp baked butter cookies packed in twin hostel-friendly packs for evening tea or morning rush.',
    image: PRODUCT_IMAGES.chipsBiscuits,
    available: true,
  },
  {
    id: 'prod-sn-3',
    name: 'Rich Dark Chocolate Bar (70% Cocoa)',
    category: ProductCategory.SNACKS,
    price: 95,
    unit: '80g Bar',
    description:
      'Smooth dark chocolate bar for a quick study energy boost during late-night assignment sprints.',
    image: PRODUCT_IMAGES.chipsBiscuits,
    available: true,
  },
  {
    id: 'prod-sn-4',
    name: 'Classic Masala Instant Cup Noodles (2 Cups)',
    category: ProductCategory.SNACKS,
    price: 90,
    unit: '2 × 75g Cups',
    description:
      'Ready in 3 minutes with just hot water—no cooking vessel needed for quick hostel meals.',
    image: PRODUCT_IMAGES.noodlesDrinks,
    available: true,
    popular: true,
  },
  {
    id: 'prod-sn-5',
    name: 'Chilled Cold Brew Coffee & Spring Water Pack',
    category: ProductCategory.SNACKS,
    price: 105,
    unit: '250ml Coffee + 1L Water',
    description:
      'Refreshing ready-to-drink iced coffee paired with a sealed 1-litre mineral water bottle.',
    image: PRODUCT_IMAGES.noodlesDrinks,
    available: true,
  },

  // Personal Care
  {
    id: 'prod-pc-1',
    name: 'Gentle Daily Nourishing Shampoo',
    category: ProductCategory.PERSONAL_CARE,
    price: 165,
    unit: '200ml Pump Bottle',
    description:
      'Mild everyday cleansing shampoo formulated for hard hostel water, leaving hair light and fresh.',
    image: PRODUCT_IMAGES.shampooSoap,
    available: true,
    popular: true,
  },
  {
    id: 'prod-pc-2',
    name: 'Lavender & Oat Moisturizing Soap (Pack of 2)',
    category: ProductCategory.PERSONAL_CARE,
    price: 90,
    unit: '2 × 100g Bars',
    description:
      'Soft-lather daily bathing bars enriched with oat milk and calming lavender essence.',
    image: PRODUCT_IMAGES.shampooSoap,
    available: true,
  },
  {
    id: 'prod-pc-3',
    name: 'Natural Mint Fresh Toothpaste',
    category: ProductCategory.PERSONAL_CARE,
    price: 75,
    unit: '100g Tube',
    description:
      'Everyday fluoride-balanced mint toothpaste for clean, long-lasting freshness before morning lectures.',
    image: PRODUCT_IMAGES.shampooSoap,
    available: true,
  },
  {
    id: 'prod-pc-4',
    name: 'Ultra-Soft Cotton Sanitary Pads',
    category: ProductCategory.PERSONAL_CARE,
    price: 115,
    unit: 'Pack of 12 · Discreet Pack',
    description:
      'Breathable cotton-top sanitary pads delivered in plain, discreet CampusEase kraft packaging.',
    image: PRODUCT_IMAGES.skincareHygiene,
    available: true,
  },
  {
    id: 'prod-pc-5',
    name: 'Daily Face Cleanser & Light Moisturizer Duo',
    category: ProductCategory.PERSONAL_CARE,
    price: 210,
    unit: '100ml + 50g Jar',
    description:
      'Non-greasy gel cleanser and lightweight daily moisturizer tailored for Dehradun seasonal weather.',
    image: PRODUCT_IMAGES.skincareHygiene,
    available: true,
  },

  // Medicines & First Aid (Permitted OTC & First Aid only)
  {
    id: 'prod-md-1',
    name: 'Compact Hostel First-Aid Pouch',
    category: ProductCategory.MEDICINES,
    price: 195,
    unit: '14-Piece Zip Kit',
    description:
      'Essential dorm room kit containing sterile gauze pads, paper tape, cotton swabs, and assorted adhesive strips.',
    image: PRODUCT_IMAGES.firstAidBandages,
    available: true,
    popular: true,
    otcNotice: true,
  },
  {
    id: 'prod-md-2',
    name: 'Flexible Fabric Adhesive Bandages',
    category: ProductCategory.MEDICINES,
    price: 55,
    unit: 'Pack of 20 Strips',
    description:
      'Breathable, water-resistant cushioned bandages for minor sports scrapes, shoe blisters, and paper cuts.',
    image: PRODUCT_IMAGES.firstAidBandages,
    available: true,
    otcNotice: true,
  },
  {
    id: 'prod-md-3',
    name: 'Topical First-Aid Antiseptic Solution',
    category: ProductCategory.MEDICINES,
    price: 80,
    unit: '100ml Sealed Bottle',
    description:
      'Gentle over-the-counter topical antiseptic liquid for cleaning minor cuts, abrasions, and surface scrapes.',
    image: PRODUCT_IMAGES.antisepticOtc,
    available: true,
    otcNotice: true,
  },
  {
    id: 'prod-md-4',
    name: 'Instant Hand Sanitizer & Sterile Cotton Roll',
    category: ProductCategory.MEDICINES,
    price: 110,
    unit: '200ml Gel + 100g Roll',
    description:
      '70% alcohol aloe-vera sanitizing pump paired with sealed absorbent sterile cotton wool.',
    image: PRODUCT_IMAGES.antisepticOtc,
    available: true,
    otcNotice: true,
  },
  {
    id: 'prod-md-5',
    name: 'Digital Fever Thermometer & ORS Sachets (OTC)',
    category: ProductCategory.MEDICINES,
    price: 160,
    unit: '1 Digital Unit + 3 ORS Packs',
    description:
      'Fast-read digital thermometer bundled with WHO-formula oral rehydration electrolyte sachets. Non-prescription OTC item.',
    image: PRODUCT_IMAGES.antisepticOtc,
    available: true,
    otcNotice: true,
  },
];

export const CAMPUS_SERVICES: CampusService[] = [
  {
    id: 'srv-print',
    name: 'Print, Scan & Spiral Binding Express',
    shortTag: 'Demo Service · Academic Support',
    description:
      'Need assignments, lab records, or presentation decks printed before class? Book a pickup/drop slot with the campus print partner.',
    turnaround: 'Within 45 mins',
    price: 40,
    priceUnit: 'base service fee',
    availabilityNote: 'Mon–Sat · 08:30 AM – 07:30 PM',
    highlights: [
      'Black & white or colour laser printing',
      'Spiral binding & transparent cover option',
      'Delivered to Academic Block or Hostel desk',
    ],
  },
  {
    id: 'srv-laundry',
    name: 'Hostel Laundry Pickup & Fold',
    shortTag: 'Demo Service · Hostel Living',
    description:
      'Doorstep laundry bag pickup from DBS Global University hostels with hygienic wash, dry, and neatly folded next-day return.',
    turnaround: '24-hour turnaround',
    price: 90,
    priceUnit: 'per 4kg load',
    availabilityNote: 'Daily · Morning & Evening slots',
    highlights: [
      'Separate hygienic wash per student bag',
      'Fabric-safe detergent & neat folding',
      'Pickup & return at hostel reception',
    ],
  },
  {
    id: 'srv-parcel',
    name: 'Gate Parcel & Nearby Errand Pickup',
    shortTag: 'Demo Service · Hyperlocal Runner',
    description:
      'Stuck in a lecture when your courier arrives at the main gate or need an urgent local store run? Book a verified campus runner.',
    turnaround: '20–35 mins',
    price: 30,
    priceUnit: 'flat runner fee',
    availabilityNote: 'Daily · 09:00 AM – 08:30 PM',
    highlights: [
      'Main gate courier & e-commerce parcel pickup',
      'Local Dehradun retail partner urgent runs',
      'Handover at your preferred campus pickup point',
    ],
  },
  {
    id: 'srv-tech',
    name: 'Laptop & Wi-Fi Quick Tech Help',
    shortTag: 'Demo Service · Device Support',
    description:
      'Quick on-campus troubleshooting for slow laptops, software installation, campus Wi-Fi configuration, or charger/cable sourcing.',
    turnaround: 'Same-day slot',
    price: 150,
    priceUnit: 'diagnostic visit',
    availabilityNote: 'Mon–Sat · 10:00 AM – 06:00 PM',
    highlights: [
      'OS & academic software installation help',
      'Campus network & printer setup',
      'Partner sourcing for chargers & adapters',
    ],
  },
  {
    id: 'srv-cycle',
    name: 'Campus Cycle Check & Air Refill',
    shortTag: 'Demo Service · Campus Mobility',
    description:
      'Keep your daily campus commute smooth with on-spot tire inflation, chain lubrication, brake tuning, and minor tube fixes.',
    turnaround: '30 mins on-spot',
    price: 50,
    priceUnit: 'service visit',
    availabilityNote: 'Tue–Sun · 09:00 AM – 05:30 PM',
    highlights: [
      'Serviced right at hostel cycle parking',
      'Tire pressure & chain oiling included',
      'Spare tube replacement available on request',
    ],
  },
  {
    id: 'srv-room',
    name: 'Hostel Desk Tidy & Water Restock',
    shortTag: 'Demo Service · Hostel Convenience',
    description:
      'Schedule a quick weekend room tidy-up paired with fresh 20L drinking water dispenser jar refill and toiletries replenishment.',
    turnaround: 'Scheduled 1-hr slot',
    price: 120,
    priceUnit: 'per session',
    availabilityNote: 'Fri–Sun · 10:00 AM – 05:00 PM',
    highlights: [
      'Drinking water jar refill coordination',
      'Hostel study desk & floor tidy support',
      'Optional essentials add-on from catalog',
    ],
  },
];

export const HOSTEL_LOCATIONS = [
  'DBS Boys Hostel — Block A Reception',
  'DBS Boys Hostel — Block B Reception',
  'DBS Girls Hostel — Block A Reception',
  'DBS Girls Hostel — Block B Reception',
  'PG / Nearby Student Residence (Main Gate Drop)',
];

export const PICKUP_POINT_LOCATIONS = [
  'Academic Block — Main Reception Desk',
  'Central Library — Student Plaza',
  'Campus Cafeteria — CampusEase Pickup Counter',
  'MBA / Management Block — Ground Porch',
  'Main University Gate — Parcel Point',
];

export const ALL_CAMPUS_LOCATIONS = [...HOSTEL_LOCATIONS, ...PICKUP_POINT_LOCATIONS];

export const SERVICE_TIME_SLOTS = [
  '09:00 AM – 11:00 AM',
  '11:00 AM – 01:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

export const DELIVERY_FEES: Record<FulfillmentMethod, number> = {
  [FulfillmentMethod.HOSTEL_DELIVERY]: 25,
  [FulfillmentMethod.CAMPUS_PICKUP]: 10,
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Aarav Sharma',
  studentId: 'DGU-2026-0418',
  program: 'MBA · Semester 2 · DBS Global University',
  mobile: '9876543210',
  email: 'aarav.sharma@dgu-student.demo',
  defaultLocation: HOSTEL_LOCATIONS[0],
};

export const SEEDED_DEMO_ORDERS: Order[] = [
  {
    id: 'CE-ORD-2401',
    createdAt: '2026-11-19T14:20:00.000Z',
    studentName: 'Aarav Sharma',
    mobile: '9876543210',
    email: 'aarav.sharma@dgu-student.demo',
    location: HOSTEL_LOCATIONS[0],
    fulfillmentMethod: FulfillmentMethod.HOSTEL_DELIVERY,
    notes: 'Please call at Block A reception desk.',
    items: [
      {
        productId: 'prod-st-1',
        name: 'A4 Spiral Ruled Notebooks (Pack of 3)',
        category: ProductCategory.STATIONERY,
        unit: '3 × 180 pages',
        price: 145,
        quantity: 1,
        image: PRODUCT_IMAGES.notebooksFiles,
      },
      {
        productId: 'prod-sn-4',
        name: 'Classic Masala Instant Cup Noodles (2 Cups)',
        category: ProductCategory.SNACKS,
        unit: '2 × 75g Cups',
        price: 90,
        quantity: 1,
        image: PRODUCT_IMAGES.noodlesDrinks,
      },
    ],
    subtotal: 235,
    convenienceFee: 25,
    total: 260,
    status: OrderStatus.READY_FOR_PICKUP,
    isDemoSample: true,
  },
  {
    id: 'CE-ORD-2389',
    createdAt: '2026-11-17T10:05:00.000Z',
    studentName: 'Priya Nair',
    mobile: '9811223344',
    email: 'priya.nair@dgu-student.demo',
    location: PICKUP_POINT_LOCATIONS[2],
    fulfillmentMethod: FulfillmentMethod.CAMPUS_PICKUP,
    notes: 'Will pick up after 11:30 AM lecture.',
    items: [
      {
        productId: 'prod-md-1',
        name: 'Compact Hostel First-Aid Pouch',
        category: ProductCategory.MEDICINES,
        unit: '14-Piece Zip Kit',
        price: 195,
        quantity: 1,
        image: PRODUCT_IMAGES.firstAidBandages,
      },
      {
        productId: 'prod-st-2',
        name: 'Smooth Matte Gel Pens (Pack of 5)',
        category: ProductCategory.STATIONERY,
        unit: '3 Blue · 2 Black · 0.5mm',
        price: 60,
        quantity: 2,
        image: PRODUCT_IMAGES.pensHighlighters,
      },
    ],
    subtotal: 315,
    convenienceFee: 10,
    total: 325,
    status: OrderStatus.COMPLETED,
    isDemoSample: true,
  },
];

export const SEEDED_DEMO_BOOKINGS: ServiceBooking[] = [
  {
    id: 'CE-SRV-8104',
    createdAt: '2026-11-19T09:15:00.000Z',
    serviceId: 'srv-print',
    serviceName: 'Print, Scan & Spiral Binding Express',
    servicePrice: 40,
    servicePriceUnit: 'base service fee',
    preferredDate: '2026-11-21',
    preferredTime: '11:00 AM – 01:00 PM',
    studentName: 'Aarav Sharma',
    mobile: '9876543210',
    email: 'aarav.sharma@dgu-student.demo',
    location: PICKUP_POINT_LOCATIONS[0],
    notes: '35-page Venture Plan report, spiral bound with transparent front sheet.',
    status: BookingStatus.CONFIRMED,
    isDemoSample: true,
  },
  {
    id: 'CE-SRV-8092',
    createdAt: '2026-11-18T16:40:00.000Z',
    serviceId: 'srv-laundry',
    serviceName: 'Hostel Laundry Pickup & Fold',
    servicePrice: 90,
    servicePriceUnit: 'per 4kg load',
    preferredDate: '2026-11-20',
    preferredTime: '04:00 PM – 06:00 PM',
    studentName: 'Rohan Verma',
    mobile: '9899001122',
    email: 'rohan.verma@dgu-student.demo',
    location: HOSTEL_LOCATIONS[1],
    notes: '1 medium laundry bag left with hostel warden desk.',
    status: BookingStatus.IN_PROGRESS,
    isDemoSample: true,
  },
];
