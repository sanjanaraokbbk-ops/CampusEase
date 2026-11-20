import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { AdminDashboardView } from './components/AdminDashboardView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { EssentialsView } from './components/EssentialsView';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { Navbar } from './components/Navbar';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { ProductModal } from './components/ProductModal';
import { ServicesView } from './components/ServicesView';
import { StudentDashboardView } from './components/StudentDashboardView';
import { useCampusStore } from './hooks/useCampusStore';
import { Order, PageView, Product, ProductCategory } from './types/campus';

const VALID_VIEWS: PageView[] = [
  'home',
  'essentials',
  'services',
  'checkout',
  'order-confirmation',
  'student',
  'admin',
];

function getInitialView(): PageView {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '') as PageView;
  return VALID_VIEWS.includes(hash) ? hash : 'home';
}

export default function App() {
  const store = useCampusStore();

  const [currentView, setCurrentView] = useState<PageView>(getInitialView);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    () => store.orders[0]?.id ?? null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync browser back/forward hash navigation
  useEffect(() => {
    const onHashChange = () => {
      const next = window.location.hash.replace('#', '') as PageView;
      if (VALID_VIEWS.includes(next)) {
        setCurrentView(next);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const navigate = useCallback((view: PageView, category?: ProductCategory) => {
    if (category) {
      setSelectedCategory(category);
    } else if (view === 'essentials') {
      // Preserve current category when clicking Essentials directly unless coming from specific category
    }
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${view}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleAddToCart = useCallback(
    (productId: string) => {
      const added = store.addToCart(productId, 1);
      if (added) {
        const prod = store.products.find((p) => p.id === productId);
        if (prod) {
          showToast(`Added "${prod.name}" to your Campus Bag`);
        }
      }
    },
    [store, showToast]
  );

  const handleOrderConfirmed = useCallback(
    (order: Order) => {
      setActiveOrderId(order.id);
      navigate('order-confirmation');
      showToast(`Demo order ${order.id} placed successfully`);
    },
    [navigate, showToast]
  );

  const handleInspectOrder = useCallback(
    (order: Order) => {
      setActiveOrderId(order.id);
      navigate('order-confirmation');
    },
    [navigate]
  );

  const activeOrder = useMemo(() => {
    if (!activeOrderId) return store.orders[0] ?? null;
    return store.orders.find((o) => o.id === activeOrderId) ?? store.orders[0] ?? null;
  }, [activeOrderId, store.orders]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1A132B]">
      <Navbar
        currentView={currentView}
        cartCount={store.cartCount}
        onNavigate={(view) => {
          if (view === 'essentials') setSelectedCategory('All');
          navigate(view);
        }}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={store.products}
            getProductQuantity={store.getProductQuantity}
            onAddToCart={handleAddToCart}
            onUpdateQty={store.updateCartQuantity}
            onInspectProduct={setInspectedProduct}
            onNavigate={navigate}
          />
        )}

        {currentView === 'essentials' && (
          <EssentialsView
            products={store.products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            getProductQuantity={store.getProductQuantity}
            onAddToCart={handleAddToCart}
            onUpdateQty={store.updateCartQuantity}
            onInspectProduct={setInspectedProduct}
          />
        )}

        {currentView === 'services' && (
          <ServicesView
            profile={store.profile}
            onCreateBooking={(input) => {
              const booking = store.createServiceBooking(input);
              showToast(`Service booking ${booking.id} confirmed`);
              return booking;
            }}
            onNavigate={navigate}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            cartItems={store.cartItems}
            profile={store.profile}
            onUpdateQty={store.updateCartQuantity}
            onRemove={store.removeFromCart}
            onPlaceOrder={store.placeOrder}
            onOrderConfirmed={handleOrderConfirmed}
            onNavigate={navigate}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationView
            order={activeOrder}
            onAdvanceStatus={(orderId, nextStatus) => {
              store.updateOrderStatus(orderId, nextStatus);
              showToast(`Order ${orderId} updated to "${nextStatus}"`);
            }}
            onNavigate={navigate}
          />
        )}

        {currentView === 'student' && (
          <StudentDashboardView
            profile={store.profile}
            orders={store.orders}
            bookings={store.bookings}
            cartCount={store.cartCount}
            onUpdateProfile={store.updateProfile}
            onInspectOrder={handleInspectOrder}
            onNavigate={navigate}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            products={store.products}
            orders={store.orders}
            bookings={store.bookings}
            onUpdateOrderStatus={(id, status) => {
              store.updateOrderStatus(id, status);
              showToast(`Order ${id} set to ${status}`);
            }}
            onUpdateBookingStatus={(id, status) => {
              store.updateBookingStatus(id, status);
              showToast(`Booking ${id} set to ${status}`);
            }}
            onToggleProductAvailability={(productId) => {
              store.toggleProductAvailability(productId);
            }}
            onResetDemoData={() => {
              store.resetDemoData();
              showToast('Starter demo data restored');
            }}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />

      <CartDrawer
        isOpen={cartOpen}
        items={store.cartItems}
        subtotal={store.cartSubtotal}
        onClose={() => setCartOpen(false)}
        onUpdateQty={store.updateCartQuantity}
        onRemove={store.removeFromCart}
        onContinueShopping={() => {
          setCartOpen(false);
          navigate('essentials');
        }}
        onCheckout={() => {
          setCartOpen(false);
          navigate('checkout');
        }}
      />

      <ProductModal
        product={inspectedProduct}
        quantityInCart={inspectedProduct ? store.getProductQuantity(inspectedProduct.id) : 0}
        onClose={() => setInspectedProduct(null)}
        onAdd={handleAddToCart}
        onUpdateQty={store.updateCartQuantity}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Non-intrusive Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-[#2A1254] text-white px-4 py-3 shadow-xl border border-white/10 flex items-center gap-2.5 text-sm font-medium"
        >
          <span className="w-5 h-5 rounded-full bg-[#38BDF8]/20 text-[#7DD3FC] inline-flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
