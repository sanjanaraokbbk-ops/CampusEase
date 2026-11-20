import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Info,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  DELIVERY_FEES,
  HOSTEL_LOCATIONS,
  PICKUP_POINT_LOCATIONS,
} from '../data/catalog';
import { CartDetailedItem, PlaceOrderInput } from '../hooks/useCampusStore';
import {
  FulfillmentMethod,
  Order,
  PageView,
  StudentProfile,
} from '../types/campus';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface CheckoutViewProps {
  user: User | null;
  authBusy: boolean;
  authError: string | null;
  onSignIn: () => void;
  cartItems: CartDetailedItem[];
  profile: StudentProfile;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onPlaceOrder: (input: PlaceOrderInput) => Promise<Order | null>;
  onOrderConfirmed: (order: Order) => void;
  onNavigate: (view: PageView) => void;
}

export function CheckoutView({
  user,
  authBusy,
  authError,
  onSignIn,
  cartItems,
  profile,
  onUpdateQty,
  onRemove,
  onPlaceOrder,
  onOrderConfirmed,
  onNavigate,
}: CheckoutViewProps) {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>(
    FulfillmentMethod.HOSTEL_DELIVERY
  );
  const [studentName, setStudentName] = useState<string>(profile.name);
  const [mobile, setMobile] = useState<string>(profile.mobile);
  const [email, setEmail] = useState<string>(profile.email);
  const [location, setLocation] = useState<string>(
    HOSTEL_LOCATIONS.includes(profile.defaultLocation)
      ? profile.defaultLocation
      : HOSTEL_LOCATIONS[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStudentName(profile.name);
    setMobile(profile.mobile);
    setEmail(profile.email);
  }, [profile]);

  const availableLocations =
    fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
      ? HOSTEL_LOCATIONS
      : PICKUP_POINT_LOCATIONS;

  useEffect(() => {
    if (!availableLocations.includes(location)) {
      setLocation(availableLocations[0]);
    }
  }, [fulfillmentMethod, availableLocations, location]);

  const availableCartItems = cartItems.filter((item) => item.product.available);
  const subtotal = availableCartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const convenienceFee = availableCartItems.length > 0 ? DELIVERY_FEES[fulfillmentMethod] : 0;
  const total = subtotal + convenienceFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F7F5FC] text-[#3B1D6E] mx-auto flex items-center justify-center mb-5">
          <ShoppingBag className="w-8 h-8" strokeWidth={1.6} />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#2A1254]">
          Your cart is currently empty
        </h1>
        <p className="text-sm text-[#52476A] mt-2 max-w-md mx-auto leading-relaxed">
          Add essentials from the CampusEase catalog before proceeding to demo checkout.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('essentials')}
            className="px-6 py-3 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Explore Essentials
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="px-6 py-3 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#F7F5FC] text-[#2A1254] text-sm font-medium transition-colors cursor-pointer"
          >
            Book a Campus Service
          </button>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (studentName.trim().length < 2) {
      nextErrors.studentName = 'Please enter your full name.';
    }
    const cleanPhone = mobile.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      nextErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!location) {
      nextErrors.location = 'Please choose a hostel or pickup location.';
    }
    if (availableCartItems.length === 0) {
      nextErrors.cart = 'All items in your cart are currently out of stock.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    setSubmitting(true);
    try {
      const order = await onPlaceOrder({
        studentName,
        mobile: mobile.replace(/\D/g, ''),
        email,
        location,
        fulfillmentMethod,
        notes,
      });

      if (order) {
        onOrderConfirmed(order);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        cart: err instanceof Error ? err.message : 'Unable to place order right now.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E2F4]">
        <button
          type="button"
          onClick={() => onNavigate('essentials')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B1D6E] hover:text-[#2A1254] mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="font-display text-3xl font-extrabold text-[#2A1254] tracking-tight">
          Demo Checkout
        </h1>
        <p className="text-sm text-[#52476A] mt-1.5">
          Confirm your fulfillment point and student details to place a demonstration order.
        </p>

        <div className="mt-4 rounded-xl bg-[#EEF8FF] border border-[#CBE7FA] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#0C4A6E]">
          <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
          <span>
            <strong>Prototype Checkout Notice:</strong> No real payment is processed and no card or
            UPI credentials are collected. Submitting this form saves a demonstration order in Cloud
            Firestore with a unique order ID.
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left: Fulfillment & Student Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* Fulfillment Option */}
          <section className="rounded-2xl bg-white border border-[#E8E2F4] p-6">
            <h2 className="font-display text-lg font-bold text-[#2A1254]">
              1. Choose Fulfillment Option
            </h2>
            <p className="text-xs text-[#655A7C] mt-1">
              Select hostel delivery where available, or collect at a convenient DBS Global
              University pickup point.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentMethod(FulfillmentMethod.HOSTEL_DELIVERY)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                    ? 'border-[#3B1D6E] bg-[#FAF8FE] ring-1 ring-[#3B1D6E]'
                    : 'border-[#E4DCF4] bg-white hover:border-[#CBBCEB]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Building2 className="w-5 h-5 text-[#3B1D6E]" />
                  <span className="font-display text-sm font-bold text-[#2A1254] tabular-nums">
                    ₹{DELIVERY_FEES[FulfillmentMethod.HOSTEL_DELIVERY]}
                  </span>
                </div>
                <p className="font-display text-sm font-bold text-[#2A1254] mt-2.5">
                  Hostel Delivery (Where Available)
                </p>
                <p className="text-xs text-[#655A7C] mt-1 leading-relaxed">
                  Dropped at DBS Boys/Girls Hostel reception desk · Est. 20–35 mins (demo)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentMethod(FulfillmentMethod.CAMPUS_PICKUP)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  fulfillmentMethod === FulfillmentMethod.CAMPUS_PICKUP
                    ? 'border-[#3B1D6E] bg-[#FAF8FE] ring-1 ring-[#3B1D6E]'
                    : 'border-[#E4DCF4] bg-white hover:border-[#CBBCEB]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <MapPin className="w-5 h-5 text-[#0284C7]" />
                  <span className="font-display text-sm font-bold text-[#2A1254] tabular-nums">
                    ₹{DELIVERY_FEES[FulfillmentMethod.CAMPUS_PICKUP]}
                  </span>
                </div>
                <p className="font-display text-sm font-bold text-[#2A1254] mt-2.5">
                  Campus Pickup Point
                </p>
                <p className="text-xs text-[#655A7C] mt-1 leading-relaxed">
                  Collect from Cafeteria, Library, or Academic Block counter · Est. 15 mins (demo)
                </p>
              </button>
            </div>
          </section>

          {/* Student Details */}
          <section className="rounded-2xl bg-white border border-[#E8E2F4] p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#2A1254]">
              2. Student &amp; Location Details
            </h2>

            <div>
              <label
                htmlFor="chk-name"
                className="block text-xs font-semibold text-[#2A1254] mb-1.5"
              >
                Student Name *
              </label>
              <input
                id="chk-name"
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (errors.studentName) setErrors((prev) => ({ ...prev, studentName: '' }));
                }}
                placeholder="Enter your full name"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                  errors.studentName ? 'border-rose-500' : 'border-[#DDD4F2]'
                }`}
              />
              {errors.studentName && (
                <p className="text-xs text-rose-600 mt-1">{errors.studentName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="chk-mobile"
                  className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                >
                  Mobile Number *
                </label>
                <input
                  id="chk-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                  }}
                  placeholder="10-digit mobile number"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                    errors.mobile ? 'border-rose-500' : 'border-[#DDD4F2]'
                  }`}
                />
                {errors.mobile && <p className="text-xs text-rose-600 mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <label
                  htmlFor="chk-email"
                  className="block text-xs font-semibold text-[#2A1254] mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="chk-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="student@dgu.edu"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1A132B] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] ${
                    errors.email ? 'border-rose-500' : 'border-[#DDD4F2]'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label
                htmlFor="chk-location"
                className="block text-xs font-semibold text-[#2A1254] mb-1.5"
              >
                {fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                  ? 'Select Hostel Delivery Location *'
                  : 'Select Campus Pickup Point *'}
              </label>
              <select
                id="chk-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] text-sm text-[#1A132B] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B1D6E]"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="chk-notes"
                className="block text-xs font-semibold text-[#2A1254] mb-1.5"
              >
                Order Notes (Optional)
              </label>
              <textarea
                id="chk-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Room number, preferred handoff window, or delivery instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] text-sm text-[#1A132B] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] resize-none"
              />
            </div>
          </section>
        </div>

        {/* Right: Sticky Order Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-[#FAF8FE] border border-[#E4DCF4] p-6">
            <h2 className="font-display text-lg font-bold text-[#2A1254]">Order Summary</h2>
            <p className="text-xs text-[#655A7C] mt-0.5 tabular-nums">
              {availableCartItems.reduce((s, i) => s + i.quantity, 0)} items selected
            </p>

            <div className="mt-4 divide-y divide-[#E8E2F4] max-h-80 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity, lineTotal }) => (
                <div key={product.id} className="py-3.5 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-[#E8E2F4] shrink-0">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      fallbackTitle={product.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2A1254] leading-snug">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#6B5E84] mt-0.5">
                      ₹{product.price} × {quantity}
                    </p>
                    {!product.available && (
                      <p className="text-xs text-rose-600 font-medium mt-0.5">
                        Out of stock (excluded)
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center border border-[#DDD4F2] rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          aria-label={`Decrease ${product.name}`}
                          className="w-7 h-7 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#F5F2FB] rounded-l-lg cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={!product.available}
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          aria-label={`Increase ${product.name}`}
                          className="w-7 h-7 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#F5F2FB] disabled:opacity-40 rounded-r-lg cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="p-1 text-[#81769A] hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#2A1254] tabular-nums shrink-0">
                    ₹{product.available ? lineTotal : 0}
                  </span>
                </div>
              ))}
            </div>

            {errors.cart && (
              <p className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {errors.cart}
              </p>
            )}

            <div className="mt-5 pt-4 border-t border-[#E4DCF4] space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-[#52476A]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#2A1254] tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[#52476A]">
                <span>
                  {fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                    ? 'Hostel Delivery Fee'
                    : 'Campus Pickup Handling'}
                </span>
                <span className="font-semibold text-[#2A1254] tabular-nums">
                  ₹{convenienceFee}
                </span>
              </div>
              <div className="pt-3 border-t border-[#E4DCF4] flex items-center justify-between text-base">
                <span className="font-display font-bold text-[#2A1254]">Demo Total</span>
                <span className="font-display text-xl font-extrabold text-[#2A1254] tabular-nums">
                  ₹{total}
                </span>
              </div>
            </div>

            {!user ? (
              <div className="mt-6">
                <GoogleAuthCard
                  compact
                  title="Sign in to Place Order"
                  description="Sign in with Google to save this order to Firestore and track simulated status updates in your Student Hub."
                  buttonLabel="Sign in with Google"
                  loading={authBusy}
                  error={authError}
                  onSignIn={onSignIn}
                />
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={availableCartItems.length === 0 || submitting}
                  className="mt-6 w-full py-3.5 px-5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] disabled:bg-[#B8ABC9] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B1D6E]"
                >
                  {submitting
                    ? 'Placing Order in Firestore...'
                    : `Place Demonstration Order — ₹${total}`}
                </button>

                <p className="text-[11px] text-[#6B5E84] text-center mt-3">
                  Demo Mode · Stored in Firebase Firestore · No card details needed
                </p>
              </>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}
