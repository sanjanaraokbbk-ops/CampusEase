import { useMemo, useState } from 'react';
import { CloudUpload, Info, Lock, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  BookingStatus,
  FulfillmentMethod,
  Order,
  OrderStatus,
  PageView,
  Product,
  ProductCategory,
  ServiceBooking,
} from '../types/campus';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface AdminDashboardViewProps {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  isAdmin: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigate: (view: PageView) => void;
  products: Product[];
  orders: Order[];
  bookings: ServiceBooking[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onToggleProductAvailability: (productId: string) => Promise<void>;
  onSyncCatalogToFirestore: () => Promise<void>;
}

type AdminTab = 'orders' | 'bookings' | 'inventory';

export function AdminDashboardView({
  user,
  authReady,
  authBusy,
  authError,
  isAdmin,
  onSignIn,
  onSignOut,
  onNavigate,
  products,
  orders,
  bookings,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  onToggleProductAvailability,
  onSyncCatalogToFirestore,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [syncingCatalog, setSyncingCatalog] = useState(false);

  const availableProductsCount = useMemo(
    () => products.filter((p) => p.available).length,
    [products]
  );

  const simulatedOrderValue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'All') return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  if (!authReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-sm text-[#6B5E84]">
        Verifying Firebase credentials...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GoogleAuthCard
          title="CampusEase Admin Sign-In"
          description="Sign in with a verified CampusEase administrator Google account to manage Firestore orders, campus service bookings, and live product inventory."
          buttonLabel="Sign in with Google"
          loading={authBusy}
          error={authError}
          onSignIn={onSignIn}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="rounded-2xl bg-white border border-[#E4DCF4] p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F7F5FC] text-[#3B1D6E] mx-auto flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-[#2A1254]">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#52476A] mt-2 leading-relaxed">
            You are signed in as <strong>{user.email}</strong>. Firestore security rules restrict
            order management and inventory updates to verified CampusEase administrators.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('student')}
              className="px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold cursor-pointer"
            >
              Go to Student Hub
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2.5 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#FAF8FE] text-sm font-medium text-[#52476A] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E2F4] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0369A1]">
            Verified Firebase Admin · {user.email}
          </p>
          <h1 className="font-display text-3xl font-extrabold text-[#2A1254] tracking-tight mt-1">
            CampusEase Admin Dashboard
          </h1>
          <p className="text-sm text-[#52476A] mt-1.5">
            Manage live Cloud Firestore orders, campus service bookings, and catalog stock
            availability in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={syncingCatalog}
            onClick={async () => {
              setSyncingCatalog(true);
              try {
                await onSyncCatalogToFirestore();
              } finally {
                setSyncingCatalog(false);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#FAF8FE] disabled:opacity-60 text-xs font-semibold text-[#2A1254] transition-colors cursor-pointer"
          >
            <CloudUpload className="w-3.5 h-3.5 text-[#3B1D6E]" />
            <span>{syncingCatalog ? 'Syncing Catalog...' : 'Sync All 20 Products to Firestore'}</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DDD4F2] bg-white hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-[#52476A] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Explicit Pilot Disclosure */}
      <div className="rounded-xl bg-[#EEF8FF] border border-[#CBE7FA] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#0C4A6E]">
        <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
        <span>
          <strong>Pilot MVP Database:</strong> Orders, bookings, and product availability are
          persisted in your Firebase Firestore database. Status changes remain simulated for pilot
          testing and do not dispatch a real payment or courier network.
        </span>
      </div>

      {/* Summary KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Total Firestore Orders</p>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {orders.length}
          </p>
          <p className="text-xs text-[#655A7C] mt-1">Synced live across sessions</p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Total Service Bookings</p>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {bookings.length}
          </p>
          <p className="text-xs text-[#655A7C] mt-1">Campus service requests</p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Available Products</p>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            {availableProductsCount}{' '}
            <span className="text-base font-medium text-[#7A6F93]">/ {products.length}</span>
          </p>
          <p className="text-xs text-[#655A7C] mt-1">Live sync with storefront</p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E2F4] p-5">
          <p className="text-xs text-[#6B5E84]">Simulated Order Volume</p>
          <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#2A1254] mt-1 tabular-nums">
            ₹{simulatedOrderValue}
          </p>
          <p className="text-xs text-[#655A7C] mt-1">Demo prototype value only</p>
        </div>
      </section>

      {/* Workspace Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F5F2FB] rounded-xl border border-[#E8E2F4] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#3B1D6E] text-white'
              : 'text-[#52476A] hover:text-[#2A1254] hover:bg-white/80'
          }`}
        >
          Order Management ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#3B1D6E] text-white'
              : 'text-[#52476A] hover:text-[#2A1254] hover:bg-white/80'
          }`}
        >
          Service Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#3B1D6E] text-white'
              : 'text-[#52476A] hover:text-[#2A1254] hover:bg-white/80'
          }`}
        >
          Product Availability ({products.length})
        </button>
      </div>

      {/* Tab 1: Order Status Management */}
      {activeTab === 'orders' && (
        <section className="rounded-2xl bg-white border border-[#E8E2F4] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EFEAF9]">
            <h2 className="font-display text-base font-bold text-[#2A1254]">
              Cloud Firestore Orders
            </h2>
            <p className="text-xs text-[#6B5E84] mt-0.5">
              Updating an order status writes to Firestore and updates the Student Hub live.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#6B5E84]">
              No orders stored in Firestore yet. Place a demo order from Essentials to test live
              sync.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8FE] border-b border-[#EFEAF9] text-xs font-semibold text-[#52476A]">
                    <th className="py-3.5 px-5">Order ID</th>
                    <th className="py-3.5 px-5">Student &amp; Location</th>
                    <th className="py-3.5 px-5">Items</th>
                    <th className="py-3.5 px-5">Total</th>
                    <th className="py-3.5 px-5">Simulated Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAF9]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FCFBFE]">
                      <td className="py-4 px-5 align-top whitespace-nowrap">
                        <p className="font-mono text-xs font-semibold text-[#2A1254]">{order.id}</p>
                        <p className="text-[11px] text-[#7A6F93] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <p className="font-semibold text-[#2A1254]">{order.studentName}</p>
                        <p className="text-xs text-[#655A7C] tabular-nums">{order.mobile}</p>
                        <p className="text-xs text-[#6B5E84] mt-0.5">
                          {order.fulfillmentMethod === FulfillmentMethod.HOSTEL_DELIVERY
                            ? 'Hostel Delivery'
                            : 'Campus Pickup'}{' '}
                          · {order.location}
                        </p>
                      </td>
                      <td className="py-4 px-5 align-top max-w-xs">
                        <p className="text-xs text-[#453B5E] leading-relaxed">
                          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
                        </p>
                      </td>
                      <td className="py-4 px-5 align-top whitespace-nowrap font-display font-bold text-[#2A1254] tabular-nums">
                        ₹{order.total}
                      </td>
                      <td className="py-4 px-5 align-top whitespace-nowrap">
                        <label htmlFor={`status-${order.id}`} className="sr-only">
                          Update status for {order.id}
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(e) =>
                            void onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className="px-3 py-1.5 rounded-lg border border-[#D4C7EC] bg-white text-xs font-semibold text-[#2A1254] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] cursor-pointer"
                        >
                          {Object.values(OrderStatus).map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Service Bookings Management */}
      {activeTab === 'bookings' && (
        <section className="rounded-2xl bg-white border border-[#E8E2F4] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EFEAF9]">
            <h2 className="font-display text-base font-bold text-[#2A1254]">
              Campus Service Booking Requests
            </h2>
            <p className="text-xs text-[#6B5E84] mt-0.5">
              Live Firestore service requests scheduled by students.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#6B5E84]">
              No campus service bookings recorded in Firestore yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF8FE] border-b border-[#EFEAF9] text-xs font-semibold text-[#52476A]">
                    <th className="py-3.5 px-5">Booking Ref</th>
                    <th className="py-3.5 px-5">Service &amp; Slot</th>
                    <th className="py-3.5 px-5">Student &amp; Location</th>
                    <th className="py-3.5 px-5">Fee</th>
                    <th className="py-3.5 px-5">Demo Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAF9]">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#FCFBFE]">
                      <td className="py-4 px-5 align-top whitespace-nowrap font-mono text-xs font-semibold text-[#2A1254]">
                        {booking.id}
                      </td>
                      <td className="py-4 px-5 align-top">
                        <p className="font-semibold text-[#2A1254]">{booking.serviceName}</p>
                        <p className="text-xs text-[#655A7C] mt-0.5 tabular-nums">
                          {booking.preferredDate} · {booking.preferredTime}
                        </p>
                      </td>
                      <td className="py-4 px-5 align-top">
                        <p className="font-medium text-[#2A1254]">{booking.studentName}</p>
                        <p className="text-xs text-[#655A7C] tabular-nums">{booking.mobile}</p>
                        <p className="text-xs text-[#6B5E84] mt-0.5">{booking.location}</p>
                      </td>
                      <td className="py-4 px-5 align-top whitespace-nowrap font-display font-bold text-[#2A1254] tabular-nums">
                        ₹{booking.servicePrice}
                      </td>
                      <td className="py-4 px-5 align-top whitespace-nowrap">
                        <label htmlFor={`bstatus-${booking.id}`} className="sr-only">
                          Update status for {booking.id}
                        </label>
                        <select
                          id={`bstatus-${booking.id}`}
                          value={booking.status}
                          onChange={(e) =>
                            void onUpdateBookingStatus(booking.id, e.target.value as BookingStatus)
                          }
                          className="px-3 py-1.5 rounded-lg border border-[#D4C7EC] bg-white text-xs font-semibold text-[#2A1254] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] cursor-pointer"
                        >
                          {Object.values(BookingStatus).map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Product Availability Management */}
      {activeTab === 'inventory' && (
        <section className="rounded-2xl bg-white border border-[#E8E2F4] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EFEAF9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#2A1254]">
                Product Availability Management
              </h2>
              <p className="text-xs text-[#6B5E84] mt-0.5">
                Toggles persist directly in Cloud Firestore and update the Essentials catalog live.
              </p>
            </div>

            <select
              aria-label="Filter inventory by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'All')}
              className="px-3 py-2 rounded-xl border border-[#DDD4F2] bg-white text-xs font-semibold text-[#2A1254] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {Object.values(ProductCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-[#EFEAF9]">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FCFBFE]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-12 rounded-lg overflow-hidden bg-[#F7F5FC] border border-[#EFEAF9] shrink-0">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      fallbackTitle={product.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#6B5E84]">
                      {product.category} · {product.unit}
                    </p>
                    <p className="text-sm font-semibold text-[#2A1254] truncate">{product.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <span className="font-display text-sm font-bold text-[#2A1254] tabular-nums">
                    ₹{product.price}
                  </span>

                  <span
                    className={`text-xs font-semibold w-24 text-right ${
                      product.available ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {product.available ? 'In Stock' : 'Out of Stock'}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={product.available}
                    aria-label={`Toggle availability for ${product.name}`}
                    onClick={() => void onToggleProductAvailability(product.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] ${
                      product.available ? 'bg-[#3B1D6E]' : 'bg-[#D5CEE3]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 mt-0.5 ${
                        product.available ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
