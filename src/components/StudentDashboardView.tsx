import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Edit3,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react';
import { ALL_CAMPUS_LOCATIONS } from '../data/catalog';
import {
  FulfillmentMethod,
  Order,
  OrderStatus,
  PageView,
  ServiceBooking,
  StudentProfile,
} from '../types/campus';

interface StudentDashboardViewProps {
  profile: StudentProfile;
  orders: Order[];
  bookings: ServiceBooking[];
  cartCount: number;
  onUpdateProfile: (next: StudentProfile) => void;
  onInspectOrder: (order: Order) => void;
  onNavigate: (view: PageView) => void;
}

const STATUS_PROGRESS: Record<OrderStatus, number> = {
  [OrderStatus.ORDER_PLACED]: 25,
  [OrderStatus.PREPARING]: 50,
  [OrderStatus.READY_FOR_PICKUP]: 75,
  [OrderStatus.COMPLETED]: 100,
};

export function StudentDashboardView({
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
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...draftProfile,
      name: draftProfile.name.trim() || profile.name,
      mobile: draftProfile.mobile.replace(/\D/g, '').slice(0, 10) || profile.mobile,
      email: draftProfile.email.trim() || profile.email,
    });
    setEditingProfile(false);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-2xl bg-[#F7F5FC] border border-[#E4DCF4] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-[#0369A1]">
            Demo Guest Mode · No Login Required · DBS Global University
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
        </div>
      </section>

      {/* Compact Metric Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Demo Orders Recorded</p>
          <p className="font-display text-2xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {orders.length}
          </p>
          <p className="text-xs text-[#52476A] mt-1">Simulated tracking saved locally</p>
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
          <p className="text-xs text-[#52476A] mt-1">Persists automatically across reloads</p>
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
                  Order statuses are simulated for demonstration and can also be updated in Admin.
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

            {orders.length === 0 ? (
              <div className="py-10 text-center">
                <Package className="w-8 h-8 text-[#9E8EC4] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#2A1254]">No orders yet</p>
                <p className="text-xs text-[#6B5E84] mt-1">
                  Add essentials to your bag and place a demo order to see it here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EFEAF9]">
                {orders.map((order) => {
                  const pct = STATUS_PROGRESS[order.status] ?? 25;
                  return (
                    <div key={order.id} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
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
                            {order.isDemoSample && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#0369A1]">Sample Demo Record</span>
                              </>
                            )}
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

                      {/* Clean Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[#EFEAF9] overflow-hidden">
                          <div
                            className="h-full bg-[#3B1D6E] rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => onInspectOrder(order)}
                          className="text-xs font-semibold text-[#3B1D6E] hover:text-[#2A1254] inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
                        >
                          <span>Track &amp; Receipt</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  All demonstration service bookings scheduled from this browser.
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
                        {booking.isDemoSample && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#0369A1]">Sample Demo Record</span>
                          </>
                        )}
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
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#2A1254]">Student Profile</h2>
                <p className="text-[11px] text-[#6B5E84]">Demo Guest Account</p>
              </div>
            </div>

            {!editingProfile && (
              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
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
              <span>Profile saved locally for faster checkout.</span>
            </div>
          )}

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">Full Name</label>
                <input
                  type="text"
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
                  value={draftProfile.studentId}
                  onChange={(e) => setDraftProfile((p) => ({ ...p, studentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#DDD4F2] text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2A1254] mb-1">Program</label>
                <input
                  type="text"
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
                  className="flex-1 py-2 px-3 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Profile
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
