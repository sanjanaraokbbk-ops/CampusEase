import { Minus, Plus, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { Product } from '../types/campus';
import { ProductImage } from './ProductImage';

interface ProductModalProps {
  product: Product | null;
  quantityInCart: number;
  onClose: () => void;
  onAdd: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onOpenCart: () => void;
}

export function ProductModal({
  product,
  quantityInCart,
  onClose,
  onAdd,
  onUpdateQty,
  onOpenCart,
}: ProductModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className="fixed inset-0 bg-[#1A132B]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#E8E2F4] grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2A1254] shadow-sm inline-flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[4/3] md:aspect-auto bg-[#F7F5FC] overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 flex flex-col justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-[#655A7C]">
              {product.category} <span aria-hidden="true">·</span> {product.unit}
            </p>
            <h3 className="font-display text-xl font-bold text-[#2A1254] mt-1.5 leading-snug">
              {product.name}
            </h3>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-2xl font-bold text-[#2A1254] tabular-nums">
                ₹{product.price}
              </span>
              <span
                className={`text-xs font-semibold ${
                  product.available ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {product.available ? 'Available for Campus Fulfillment' : 'Currently Out of Stock'}
              </span>
            </div>

            <p className="text-sm text-[#52476A] mt-4 leading-relaxed">{product.description}</p>

            {product.otcNotice && (
              <div className="mt-4 p-3 rounded-xl bg-[#EEF8FF] border border-[#CBE7FA] text-xs text-[#0C4A6E] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
                <span>
                  Permitted first-aid / OTC item only. Prescription medicines are never supplied
                  without licensed pharmacy verification.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-[#EFEAF9]">
            {!product.available ? (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-[#EFEAF9] text-[#7A6F93] text-sm font-medium cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 inline-flex items-center justify-between border border-[#3B1D6E] rounded-xl bg-[#F7F5FC] px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(product.id, quantityInCart - 1)}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-[#2A1254] tabular-nums">
                    {quantityInCart} in bag
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(product.id, quantityInCart + 1)}
                    aria-label="Increase quantity"
                    className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="py-3 px-4 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  View Bag
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(product.id)}
                className="w-full py-3 px-5 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart — ₹{product.price}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
