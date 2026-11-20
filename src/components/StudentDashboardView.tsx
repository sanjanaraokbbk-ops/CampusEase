import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Edit3,
  LogOut,
  Package,
  ShoppingBag,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ALL_CAMPUS_LOCATIONS } from '../data/catalog';
import {
  FulfillmentMethod,
  Order,
  OrderStatus,
  PageView,
  ServiceBooking,
  StudentProfile,
} from '../types/campus';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface StudentDashboardViewProps {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  dataLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  profile: StudentProfile;
  orders: Order[];
  bookings: ServiceBooking[];
  cartCount: number;
  onUpdateProfile: (next: StudentProfile) => Promise<void>;
  onInspectOrder: (order: Order) => void;
  onNavigate: (view: PageView) => void;
}

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  [OrderStatus.ORDER_PLACED]: 25,
  [OrderStatus.PREPARING]: 50,
  [OrderStatus.READY_FOR_PICKUP]: 75,
  [OrderStatus.COMPLETED]: 100,
};

const ORDER_STAGES: OrderStatus[] = [
  OrderStatus.ORDER_PLACED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.COMPLETED,
];

export function StudentDashboardView({
  user,
  authReady,
  authBusy,
  authError,
  dataLoading,
  onSignIn,
  onSignOut,
  profile,
  orders,
  bookings,
  cartCount,
  onUpdateProfile,
  onInspectOrder,
  onNavigate,
}: StudentDashboardViewProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<StudentProfile>(profile);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  useEffect(() => {
    setDraftProfile(profile);
  }, [profile]);

  if (!authReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-sm text-[#6B5E84]">
        Connecting to Firebase...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GoogleAuthCard
          title="Sign in to Your CampusEase Student Hub"
          description="Sign in with your Google account to view real-time Firestore order tracking, campus service booking history, and your saved DBS Global University profile."
          buttonLabel="Sign in with Google"
          loading={authBusy}
          error={authError}
          onSignIn={onSignIn}
        />
      </div>
    );
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    const cleanPhone = draftProfile.mobile.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setProfileError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftProfile.email.trim())) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setSavingProfile(true);
    try {
      await onUpdateProfile({
        ...draftProfile,
        name: draftProfile.name.trim() || profile.name,
        mobile: cleanPhone,
        email: draftProfile.email.trim(),
      });
      setEditingProfile(false);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-2xl bg-[#F7F5FC] border border-[#E4DCF4] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#0369A1]">
            Cloud-Synced Student Account · {user.email}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-[#52476A] mt-1.5">
            {profile.program} <span aria-hidden="true">·</span> Preferred Point:{' '}
            {profile.defaultLocation}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('essentials')}
            className="px-4 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Essentials</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EEF8FF] border border-[#D4C7EC] text-[#2A1254] text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-[#0284C7]" />
            <span>Book Service</span>
          </button>
          <button
            type="button"
            disabled={authBusy}
            onClick={onSignOut}
            className="px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] bg-white hover:bg-rose-50 hover:text-rose-700 text-[#52476A] text-sm font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* Compact Metric Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Your Cloud Orders</p>
          <p className="font-display text-2xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {orders.length}
          </p>
          <p className="text-xs text-[#52476A] mt-1">Synced live with Firebase Firestore</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Campus Service Bookings</p>
          <p className="font-display text-2xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {bookings.length}
          </p>
          <p className="text-xs text-[#52476A] mt-1">Print, laundry, errands &amp; support</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Items Currently in Bag</p>
          <p className="font-display text-2xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {cartCount}
          </p>
          <p className="text-xs text-[#52476A] mt-1">Ready for campus checkout</p>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Orders & Booking History */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Orders */}
          <section className="rounded-2xl bg-white border border-[#E8E2F4] p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFEAF9]">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2A1254]">Recent Orders</h2>
                <p className="text-xs text-[#6B5E84] mt-0.5">
                  Stored in Cloud Firestore with real-time simulated fulfillment status updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('essentials')}
                className="text-xs font-semibold text-[#3B1D6E] hover:underline whitespace-nowrap cursor-pointer"
              >
                New Order
              </button>
            </div>

            {dataLoading ? (
              <div className="py-10 text-center text-sm text-[#6B5E84]">
                Loading your orders from Firestore...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-10 text-center">
                <Package className="w-8 h-8 text-[#9E8EC4] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#2A1254]">No orders placed yet</p>
                <p className="text-xs text-[#6B5E84] mt-1">
                  Add essentials to your bag and place a demo order to see it synced here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFEAF9]">
                {orders.map((order) => {
                  const pct = STATUS_PROGRESS[order.status] ?? 25;
                  const isExpanded = Boolean(expandedOrders[order.id]);
                  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const currentStageIndex = Math.max(0, ORDER_STAGES.indexOf(order.status));

                  return (
                    <div key={order.id} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5E84]">
                            <span className="font-mono font-semibold text-[#2A1254]">
                              {order.id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#2A1254] mt-1">
                            {order.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                          </p>
                          <p className="text-xs text-[#655A7C] mt-0.5">
                            {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                              ? 'Hostel Delivery'
                              : 'Campus Pickup'}{' '}
                            <span aria-hidden="true">·</span> {order.location}
                          </p>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <p className="font-display text-base font-bold text-[#2A1254] tabular-nums">
                            ₹{order.total}
                          </p>
                          <p className="text-xs font-semibold text-[#3B1D6E] mt-0.5">
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[140px] h-1.5 rounded-full bg-[#EFEAF9] overflow-hidden">
                          <div
                            className="h-full bg-[#3B1D6E] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={`order-details-${order.id}`}
                            onClick={() => toggleOrderDetails(order.id)}
                            className="px-3 py-1.5 rounded-lg border border-[#D4C7EC] bg-[#FAF8FE] hover:bg-[#EFEAF9] text-xs font-semibold text-[#3B1D6E] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E]"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => onInspectOrder(order)}
                            className="text-xs font-semibold text-[#3B1D6E] hover:text-[#2A1254] inline-flex items-center gap-1 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:underline"
                          >
                            <span>Track &amp; Receipt</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Itemized Order Details */}
                      {isExpanded && (
                        <div
                          id={`order-details-${order.id}`}
                          className="mt-4 pt-4 px-4 sm:px-5 pb-5 rounded-xl bg-[#FAF8FE] border border-[#E8E2F4] space-y-5"
                        >
                          {/* Itemized Table */}
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#6B5E84] pb-2.5 border-b border-[#E8E2F4]">
                              <span className="font-semibold text-[#2A1254]">
                                Order Items · {order.id}
                              </span>
                              <span className="tabular-nums">
                                {order.items.length}{' '}
                                {order.items.length === 1 ? 'product' : 'products'} · {totalUnits}{' '}
                                {totalUnits === 1 ? 'unit' : 'units'}
                              </span>
                            </div>

                            {/* Column Headers (Desktop) */}
                            <div className="hidden sm:grid sm:grid-cols-12 gap-3 pt-2.5 pb-1.5 text-[11px] font-semibold text-[#6B5E84] border-b border-[#EFEAF9]">
                              <span className="col-span-6">Product</span>
                              <span className="col-span-2 text-center">Qty</span>
                              <span className="col-span-2 text-right">Unit Price</span>
                              <span className="col-span-2 text-right">Line Total</span>
                            </div>

                            <ul className="divide-y divide-[#EFEAF9]">
                              {order.items.map((item) => (
                                <li
                                  key={`${order.id}-${item.productId}`}
                                  className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                                >
                                  <div className="sm:col-span-6 flex items-center gap-3 min-w-0">
                                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-white border border-[#E8E2F4] shrink-0">
                                      <ProductImage
                                        src={item.image}
                                        alt={item.name}
                                        fallbackTitle={item.name}
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#2A1254] leading-snug">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-[#6B5E84] mt-0.5 truncate">
                                        {item.category} <span aria-hidden="true">·</span>{' '}
                                        {item.unit}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="sm:col-span-2 flex sm:justify-center justify-between text-xs sm:text-sm tabular-nums">
                                    <span className="sm:hidden text-[#6B5E84]">Quantity</span>
                                    <span className="font-medium text-[#2A1254]">
                                      ×{item.quantity}
                                    </span>
                                  </div>

                                  <div className="sm:col-span-2 flex sm:justify-end justify-between text-xs sm:text-sm tabular-nums">
                                    <span className="sm:hidden text-[#6B5E84]">Unit Price</span>
                                    <span className="text-[#52476A]">₹{item.price}</span>
                                  </div>

                                  <div className="sm:col-span-2 flex sm:justify-end justify-between text-sm tabular-nums">
                                    <span className="sm:hidden text-xs text-[#6B5E84]">
                                      Line Total
                                    </span>
                                    <span className="font-bold text-[#2A1254]">
                                      ₹{item.price * item.quantity}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Breakdown & Fulfillment Metadata */}
                          <div className="pt-4 border-t border-[#E8E2F4] grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                            <div className="space-y-1.5 text-[#52476A]">
                              <p className="font-semibold text-[#2A1254]">
                                Fulfillment &amp; Contact
                              </p>
                              <p>
                                {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                                  ? 'Hostel Delivery'
                                  : 'Campus Pickup Point'}{' '}
                                <span aria-hidden="true">·</span> {order.location}
                              </p>
                              <p className="tabular-nums">
                                {order.studentName} · {order.mobile}
                              </p>
                              <p className="text-[#6B5E84]">
                                Placed{' '}
                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </p>
                              {order.notes && (
                                <p className="pt-1 text-[#453B5E]">
                                  <span className="font-semibold text-[#2A1254]">Note: </span>
                                  {order.notes}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5 sm:text-right">
                              <div className="flex justify-between sm:justify-end sm:gap-8 text-[#52476A]">
                                <span>Items Subtotal</span>
                                <span className="font-medium text-[#2A1254] tabular-nums w-16 text-right">
                                  ₹{order.subtotal}
                                </span>
                              </div>
                              <div className="flex justify-between sm:justify-end sm:gap-8 text-[#52476A]">
                                <span>
                                  {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                                    ? 'Hostel Delivery Fee'
                                    : 'Campus Pickup Fee'}
                                </span>
                                <span className="font-medium text-[#2A1254] tabular-nums w-16 text-right">
                                  ₹{order.convenienceFee}
                                </span>
                              </div>
                              <div className="pt-2 mt-1 border-t border-[#E4DCF4] flex justify-between sm:justify-end sm:gap-8 text-sm">
                                <span className="font-display font-bold text-[#2A1254]">Total</span>
                                <span className="font-display font-extrabold text-[#2A1254] tabular-nums w-16 text-right">
                                  ₹{order.total}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Simulated Status Progression Strip */}
                          <div className="pt-3 border-t border-[#E8E2F4] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              {ORDER_STAGES.map((stage, idx) => (
                                <span key={stage} className="inline-flex items-center gap-2">
                                  <span
                                    className={
                                      idx === currentStageIndex
                                        ? 'font-bold text-[#3B1D6E]'
                                        : idx < currentStageIndex
                                          ? 'font-medium text-emerald-700'
                                          : 'text-[#8E82A6]'
                                    }
                                  >
                                    {stage}
                                  </span>
                                  {idx < ORDER_STAGES.length - 1 && (
                                    <span className="text-[#C7BBE3]" aria-hidden="true">
                                      /
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="text-[#6B5E84]">Simulated status</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Service Booking History */}
          <section className="rounded-2xl bg-white border border-[#E8E2F4] p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFEAF9]">
              <div>
                <h2 className="font-display text-lg font-bold text-[#2A1254]">
                  Campus Service Booking History
                </h2>
                <p className="text-xs text-[#6B5E84] mt-0.5">
                  Live Firestore record of your scheduled DBS Global University campus services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="text-xs font-semibold text-[#0369A1] hover:underline whitespace-nowrap cursor-pointer"
              >
                Book Another
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarCheck className="w-8 h-8 text-[#9E8EC4] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#2A1254]">No campus bookings yet</p>
                <p className="text-xs text-[#6B5E84] mt-1">
                  Try booking printing, hostel laundry, or parcel pickup under Campus Services.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFEAF9]">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5E84]">
                        <span className="font-mono font-semibold text-[#2A1254]">{booking.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {booking.preferredDate} ({booking.preferredTime})
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#2A1254] mt-1">
                        {booking.serviceName}
                      </h3>
                      <p className="text-xs text-[#655A7C] mt-0.5">{booking.location}</p>
                      {booking.notes && (
                        <p className="text-xs text-[#7A6F93] mt-1">Note: {booking.notes}</p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="font-display text-sm font-bold text-[#2A1254] tabular-nums">
                        ₹{booking.servicePrice}
                      </p>
                      <p className="text-xs font-semibold text-[#0369A1] mt-0.5">
                        {booking.status} (Demo)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Student Profile Card */}
        <aside className="lg:col-span-4 rounded-2xl bg-white border border-[#E8E2F4] p-6">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#EFEAF9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EFEAF9] text-[#3B1D6E] inline-flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#2A1254]">Student Profile</h2>
                <p className="text-[11px] text-[#6B5E84]">Stored securely in Firestore</p>
              </div>
            </div>

            {!editingProfile && (
              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
                  setProfileError(null);
                  setEditingProfile(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B1D6E] hover:text-[#2A1254] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {savedNotice && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Profile saved to Firestore.</span>
            </div>
          )}

          {profileError && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {profileError}
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">Full Name</label>
                <input
                  type="text"
                  maxLength={100}
                  value={draftProfile.name}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={draftProfile.studentId}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, studentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">Program</label>
                <input
                  type="text"
                  maxLength={120}
                  value={draftProfile.program}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, program: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={draftProfile.mobile}
                  onChange={(e) =>
                    setDraftProfile((p) => ({
                      ...p,
                      mobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">Email</label>
                <input
                  type="email"
                  maxLength={120}
                  value={draftProfile.email}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">
                  Default Hostel / Pickup Point
                </label>
                <select
                  value={draftProfile.defaultLocation}
                  onChange={(e) =>
                    setDraftProfile((p) => ({ ...p, defaultLocation: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm bg-white"
                >
                  {ALL_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save to Cloud'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="py-2 px-3 rounded-xl border border-[#DDD4F2] text-xs font-medium text-[#52476A] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-4 space-y-3.5 text-sm">
              <div>
                <dt className="text-xs text-[#6B5E84]">Name</dt>
                <dd className="font-semibold text-[#2A1254] mt-0.5">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B5E84]">Student ID</dt>
                <dd className="font-mono text-xs font-medium text-[#2A1254] mt-0.5">
                  {profile.studentId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B5E84]">Program</dt>
                <dd className="text-[#2A1254] mt-0.5">{profile.program}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B5E84]">Contact</dt>
                <dd className="text-[#2A1254] mt-0.5 tabular-nums">{profile.mobile}</dd>
                <dd className="text-xs text-[#52476A]">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B5E84]">Default Fulfillment Location</dt>
                <dd className="text-[#2A1254] mt-0.5">{profile.defaultLocation}</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>
    </div>
  );
}
