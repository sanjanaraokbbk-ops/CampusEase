import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { PageView } from '../types/campus';

interface NavbarProps {
  currentView: PageView;
  cartCount: number;
  onNavigate: (view: PageView) => void;
  onOpenCart: () => void;
}

const NAV_ITEMS: { id: PageView; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'essentials', label: 'Essentials' },
  { id: 'services', label: 'Campus Services' },
  { id: 'student', label: 'Student Hub' },
  { id: 'admin', label: 'Admin' },
];

export function Navbar({ currentView, cartCount, onNavigate, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-display text-xl font-extrabold tracking-tight text-[#2A1254] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] rounded-md"
        >
          <span
            className="w-7 h-7 rounded-lg bg-[#3B1D6E] text-white inline-flex items-center justify-center text-xs font-bold tracking-normal"
            aria-hidden="true"
          >
            CE
          </span>
          <span>CampusEase</span>
        </button>

        {/* Zone 2: 5 Single-Line Text Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52476A]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === 'essentials' && currentView === 'checkout') ||
              (item.id === 'student' && currentView === 'order-confirmation');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] rounded ${
                  isActive
                    ? 'text-[#2A1254] font-semibold'
                    : 'hover:text-[#2A1254]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-[#3B1D6E]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (Shopping Bag) + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${cartCount} items`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B1D6E] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span>Cart</span>
            <span className="tabular-nums font-semibold text-[#BAE6FD]">({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E4DCF4] text-[#2A1254] hover:bg-[#F7F5FC] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E8E2F4] px-4 py-3 space-y-1 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFEAF9] text-[#2A1254] font-semibold'
                    : 'text-[#52476A] hover:bg-[#F7F5FC] hover:text-[#2A1254]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
