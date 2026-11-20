import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types/campus';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onInspect: (product: Product) => void;
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onUpdateQty,
  onInspect,
}: ProductCardProps) {
  return (
    <article className="group bg-white rounded-2xl border border-[#E8E2F4] overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-[#D4C7EC]">
      {/* Product Image */}
      <button
        type="button"
        onClick={() => onInspect(product)}
        className="relative aspect-[4/3] w-full bg-[#F7F5FC] overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B1D6E] cursor-pointer"
        aria-label={`View details for ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          fallbackTitle={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
            !product.available ? 'opacity-55 grayscale-[40%]' : ''
          }`}
        />
      </button>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#6B5E84]">
            <span className="truncate">{product.category}</span>
            <span
              className={`shrink-0 font-medium ${
                product.available ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {product.available ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onInspect(product)}
            className="text-left mt-1.5 block w-full focus-visible:outline-none focus-visible:underline cursor-pointer"
          >
            <h3 className="font-display text-base font-semibold text-[#2A1254] leading-snug group-hover:text-[#4C278C] transition-colors">
              {product.name}
            </h3>
          </button>

          <p className="text-xs text-[#6B5E84] mt-1">{product.unit}</p>
        </div>

        {/* Price & Action Baseline */}
        <div className="pt-3 border-t border-[#F1ECF9] flex items-center justify-between gap-3">
          <div className="tabular-nums">
            <span className="font-display text-lg font-bold text-[#2A1254]">
              ₹{product.price}
            </span>
          </div>

          {!product.available ? (
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-xl bg-[#F4F0FA] text-[#8E82A6] text-xs font-medium whitespace-nowrap shrink-0 cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="inline-flex items-center border border-[#3B1D6E] rounded-xl bg-[#F7F5FC] shrink-0">
              <button
                type="button"
                onClick={() => onUpdateQty(product.id, quantity - 1)}
                aria-label={`Decrease quantity of ${product.name}`}
                className="w-8 h-9 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] rounded-l-xl transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold text-[#2A1254] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQty(product.id, quantity + 1)}
                aria-label={`Increase quantity of ${product.name}`}
                className="w-8 h-9 inline-flex items-center justify-center text-[#3B1D6E] hover:bg-[#EFEAF9] rounded-r-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(product.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
