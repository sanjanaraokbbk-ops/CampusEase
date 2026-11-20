import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { CATEGORY_DETAILS, HERO_IMAGE } from '../data/catalog';
import { PageView, Product, ProductCategory } from '../types/campus';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

interface HomeViewProps {
  products: Product[];
  getProductQuantity: (productId: string) => number;
  onAddToCart: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onInspectProduct: (product: Product) => void;
  onNavigate: (view: PageView, category?: ProductCategory) => void;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Select Essentials or a Service',
    description:
      'Pick stationery, hostel snacks, personal care, OTC first-aid items, or book a campus errand in under a minute.',
  },
  {
    step: '02',
    title: 'Pick Hostel or Campus Point',
    description:
      'Choose DBS Global University hostel delivery where available, or select a nearby campus pickup desk between classes.',
  },
  {
    step: '03',
    title: 'Confirm & Track Your Request',
    description:
      'Get an instant order or booking reference ID and follow simulated status updates from your Student Hub.',
  },
];

const BENEFITS = [
  {
    icon: Clock,
    title: 'Save Time Between Lectures',
    description:
      'Skip walking off-campus for notebooks, snacks, or urgent toiletries during busy academic schedules and exam weeks.',
  },
  {
    icon: Wallet,
    title: 'Student-Friendly Pricing',
    description:
      'Transparent MRP-aligned product prices with affordable campus pickup (₹10) and hostel fulfillment (₹25) fees.',
  },
  {
    icon: Building2,
    title: 'Built for DBS Global University',
    description:
      'Pickup points and hostel locations tailored directly to Boys & Girls Hostels, Academic Block, Library, and Cafeteria.',
  },
  {
    icon: ShieldCheck,
    title: 'Curated & Responsible Catalog',
    description:
      'Stocked for daily hostel living, with strictly over-the-counter first-aid supplies and clear local pilot transparency.',
  },
];

export function HomeView({
  products,
  getProductQuantity,
  onAddToCart,
  onUpdateQty,
  onInspectProduct,
  onNavigate,
}: HomeViewProps) {
  const popularProducts = products.filter((p) => p.popular).slice(0, 6);

  return (
    <div>
      {/* Slim Brand Banner */}
      <div className="bg-[#2A1254] text-white border-b border-[#3B1D6E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#F3EEFC]">
            Your Campus. Your Essentials. Your Convenience.
          </p>
          <span className="hidden sm:inline text-[#7DD3FC]" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-[#7DD3FC] hover:text-white underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
          >
            Book Campus Services Now
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F7F5FC] to-white border-b border-[#EFEAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-[#4C278C]">
                DBS Global University · Dehradun <span aria-hidden="true">·</span> Campus Life, Made
                Easier
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl font-extrabold text-[#2A1254] tracking-tight leading-[1.12] mt-4"
                style={{ textWrap: 'balance' }}
              >
                Everything You Need, Just a Click Away.
              </h1>

              <p className="text-base sm:text-lg text-[#52476A] mt-5 leading-relaxed max-w-xl">
                Order everyday stationery, hostel snacks, personal care, and first-aid supplies—or
                book essential campus services—without stepping off campus or disrupting your class
                schedule.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onNavigate('essentials')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B1D6E]"
                >
                  <span>Explore Essentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#EEF8FF] text-[#2A1254] border border-[#D4C7EC] hover:border-[#38BDF8] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0284C7]"
                >
                  <CalendarCheck className="w-4 h-4 text-[#0284C7]" />
                  <span>Book a Campus Service</span>
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-[#E4DCF4] bg-[#EFEAF9] shadow-sm">
                <ProductImage
                  src={HERO_IMAGE}
                  alt="CampusEase deep purple delivery tote with university notebooks, pastel highlighters, snacks, and chilled water bottle on a sunlit student desk"
                  fallbackTitle="CampusEase Student Essentials"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Full-Width Key Highlights Strip Below Hero Split */}
          <div className="mt-10 pt-8 border-t border-[#E8E2F4] grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-display text-lg font-bold text-[#2A1254] tabular-nums">
                ₹10 – ₹25
              </p>
              <p className="text-xs text-[#655A7C] mt-0.5">
                Student-friendly pickup &amp; hostel fulfillment
              </p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[#2A1254] tabular-nums">
                20 Essentials
              </p>
              <p className="text-xs text-[#655A7C] mt-0.5">
                Stationery, snacks, care &amp; OTC first aid
              </p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[#2A1254] tabular-nums">
                6 Campus Services
              </p>
              <p className="text-xs text-[#655A7C] mt-0.5">
                Print express, laundry, errands &amp; tech help
              </p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[#2A1254]">10 Campus Points</p>
              <p className="text-xs text-[#655A7C] mt-0.5">
                Boys/Girls Hostels, Library &amp; Academic Block
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0369A1]">Curated for Hostel &amp; Campus</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A1254] mt-1">
              Featured Product Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('essentials')}
            className="text-sm font-semibold text-[#3B1D6E] hover:text-[#2A1254] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(ProductCategory).map((category) => {
            const detail = CATEGORY_DETAILS[category];
            const count = products.filter((p) => p.category === category && p.available).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onNavigate('essentials', category)}
                className="group text-left bg-white rounded-2xl border border-[#E8E2F4] overflow-hidden hover:-translate-y-0.5 hover:shadow-md hover:border-[#CBBCEB] transition-all duration-150 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E]"
              >
                <div className="aspect-[4/3] w-full bg-[#F7F5FC] overflow-hidden">
                  <ProductImage
                    src={detail.image}
                    alt={category}
                    fallbackTitle={category}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#6B5E84] tabular-nums">
                      {count} available <span aria-hidden="true">·</span> {detail.itemHint}
                    </p>
                    <h3 className="font-display text-base font-bold text-[#2A1254] mt-1.5 group-hover:text-[#4C278C] transition-colors">
                      {category}
                    </h3>
                    <p className="text-xs text-[#52476A] mt-2 leading-relaxed">{detail.summary}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#3B1D6E]">
                    <span>Explore category</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Products */}
      <section className="bg-[#FAF8FE] border-y border-[#EFEAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#0369A1]">Most Ordered on Campus</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A1254] mt-1">
                Popular Student Essentials
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('essentials')}
              className="text-sm font-semibold text-[#3B1D6E] hover:text-[#2A1254] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>View All 20 Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getProductQuantity(product.id)}
                onAdd={onAddToCart}
                onUpdateQty={onUpdateQty}
                onInspect={onInspectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How CampusEase Works + Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* How It Works */}
        <div>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#0369A1]">Simple Three-Step Flow</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A1254] mt-1">
              How CampusEase Works
            </h2>
            <p className="text-sm text-[#52476A] mt-2 leading-relaxed">
              Designed around student routines at DBS Global University so you never miss a lecture
              or walk far for daily necessities.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="pt-5 border-t-2 border-[#3B1D6E]/25 flex flex-col gap-2"
              >
                <span className="font-mono text-xs font-semibold text-[#0369A1]">{item.step}</span>
                <h3 className="font-display text-lg font-bold text-[#2A1254]">{item.title}</h3>
                <p className="text-sm text-[#52476A] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits + Campus Services Highlight */}
        <div className="rounded-3xl bg-[#F7F5FC] border border-[#E6DDF7] p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E2D8F5]">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#0369A1]">Why Students Use CampusEase</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2A1254] mt-1">
                Built Around Real Hostel &amp; Campus Needs
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors whitespace-nowrap self-start lg:self-auto cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book a Campus Service</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E4DCF4] text-[#3B1D6E] inline-flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#2A1254]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[#52476A] leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
