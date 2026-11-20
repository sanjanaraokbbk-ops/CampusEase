import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartDetailedItem } from '../hooks/useCampusStore';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartDetailedItem[];
  subtotal: number;
  onClose: () => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  subtotal,
  onClose,
  onUpdateQty,
  onRemove,
  onContinueShopping,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const hasUnavailableItems = items.some((item) => !item.product.available);
  const availableItemsCount = items
    .filter((i) => i.product.available)
    .reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A132B]/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-[#E8E2F4]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8E2F4] flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#2A1254]">Your Campus Bag</h2>
            <p className="text-xs text-[#655A7C] mt-0.5 tabular-nums">
              {items.reduce((sum, i) => sum + i.quantity, 0)} items · Stored locally on this device
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping cart"
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#52476A] hover:bg-[#F7F5FC] hover:text-[#2A1254] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F5FC] text-[#3B1D6E] flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7" strokeWidth={1.6} />
            </div>
            <h3 className="font-display text-base font-semibold text-[#2A1254]">
              Your bag is empty
            </h3>
            <p className="text-sm text-[#655A7C] mt-2 max-w-xs leading-relaxed">
              Add notebooks, hostel snacks, personal care, or first-aid supplies for quick campus
              pickup or hostel drop.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Explore Essentials
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#EFEAF9]">
              {items.map(({ product, quantity, lineTotal }) => (
                <div key={product.id} className="py-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F7F5FC] shrink-0 border border-[#EFEAF9]">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      fallbackTitle={product.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-[#655A7C] truncate">
                          {product.category} · {product.unit}
                        </p>
                        <h3 className="text-sm font-semibold text-[#2A1254] leading-snug mt-0.5">
                          {product.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="text-[#81769A] hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {!product.available && (
                      <p className="text-xs text-rose-700 font-medium mt-1">
                        Currently out of stock — remove to proceed cleanly
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center border border-[#DDD4F2] rounded-lg bg-[#FAF8FE]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          aria-label={`Decrease quantity of ${product.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] rounded-l-lg transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-[#2A1254] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={!product.available}
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          aria-label={`Increase quantity of ${product.name}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] disabled:opacity-40 rounded-r-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <span className="text-sm font-bold text-[#2A1254]">₹{lineTotal}</span>
                        {quantity > 1 && (
                          <p className="text-[11px] text-[#7A6F93]">₹{product.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="border-t border-[#E8E2F4] bg-[#FAF8FE] px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-[#52476A]">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-[#2A1254] tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#655A7C]">
                  <span>Campus Pickup / Hostel Delivery</span>
                  <span className="tabular-nums">₹10 – ₹25 at checkout</span>
                </div>
              </div>

              {hasUnavailableItems && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Out-of-stock items are excluded at checkout.
                </p>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={availableItemsCount === 0}
                  onClick={onCheckout}
                  className="w-full py-3 px-5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] disabled:bg-[#B8ABC9] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onContinueShopping}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#DDD4F2] bg-white hover:bg-[#F7F5FC] text-[#2A1254] text-sm font-medium transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
