import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PageView, Product } from '../types/campus';
import { ProductImage } from './ProductImage';

interface NavbarProps {
  currentView: PageView;
  cartCount: number;
  products: Product[];
  searchQuery: string;
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  isAdmin: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onSelectProduct: (product: Product) => void;
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

export function Navbar({
  currentView,
  cartCount,
  products,
  searchQuery,
  user,
  authReady,
  authBusy,
  isAdmin,
  onSignIn,
  onSignOut,
  onSearchChange,
  onSearchSubmit,
  onSelectProduct,
  onNavigate,
  onOpenCart,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingProducts = useMemo(() => {
    if (!trimmedQuery) return [];
    return products.filter((product) => {
      const haystack =
        `${product.name} ${product.category} ${product.unit} ${product.description}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [products, trimmedQuery]);

  const userFirstName = useMemo(() => {
    if (!user) return '';
    if (user.displayName) return user.displayName.split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return 'Account';
  }, [user]);

  const userInitial = useMemo(() => {
    const source = user?.displayName || user?.email || 'U';
    return source.charAt(0).toUpperCase();
  }, [user]);

  // Close search and account dropdowns on outside click or Escape
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (accountContainerRef.current && !accountContainerRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setAccountMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const handleNavClick = (view: PageView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setAccountMenuOpen(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handlePickProduct = (product: Product) => {
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    onSelectProduct(product);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 lg:gap-5">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#2A1254] whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] rounded-md cursor-pointer"
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
          className="hidden md:flex items-center gap-4 lg:gap-5 text-sm font-medium text-[#52476A]"
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
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] rounded cursor-pointer ${
                  isActive ? 'text-[#2A1254] font-semibold' : 'hover:text-[#2A1254]'
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

        {/* Zone 3: Global Product Search + Account/Sign In + Primary Cart Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="relative hidden lg:block w-44 xl:w-56">
            <form onSubmit={handleSubmit} role="search" aria-label="Search campus products">
              <Search className="w-4 h-4 text-[#7A6F93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setDropdownOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setDropdownOpen(true);
                }}
                placeholder="Search essentials..."
                aria-label="Search products across all categories"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#DDD4F2] bg-[#FAF8FE] focus:bg-white text-xs sm:text-sm text-[#1A132B] placeholder:text-[#8E82A6] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E] focus:border-transparent transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setDropdownOpen(false);
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#7A6F93] hover:text-[#2A1254] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Instant Search Results Dropdown */}
            {dropdownOpen && trimmedQuery.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E4DCF4] shadow-xl overflow-hidden z-50">
                <div className="px-4 py-2.5 bg-[#FAF8FE] border-b border-[#EFEAF9] flex items-center justify-between text-xs text-[#6B5E84]">
                  <span>Results across all categories</span>
                  <span className="tabular-nums font-medium">{matchingProducts.length} found</span>
                </div>

                {matchingProducts.length === 0 ? (
                  <div className="p-5 text-center text-xs text-[#6B5E84]">
                    No products matching &ldquo;{searchQuery.trim()}&rdquo;.
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-[#EFEAF9] max-h-80 overflow-y-auto">
                      {matchingProducts.slice(0, 6).map((product) => (
                        <li key={product.id}>
                          <button
                            type="button"
                            onClick={() => handlePickProduct(product)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#FAF8FE] text-left transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F7F5FC] border border-[#EFEAF9] shrink-0">
                              <ProductImage
                                src={product.image}
                                alt={product.name}
                                fallbackTitle={product.name}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#2A1254] truncate">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-[#6B5E84] truncate">
                                {product.category} ·{' '}
                                {product.available ? 'In Stock' : 'Out of Stock'}
                              </p>
                            </div>
                            <span className="font-display text-xs font-bold text-[#2A1254] tabular-nums shrink-0">
                              ₹{product.price}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => {
                        onSearchSubmit(searchQuery);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 bg-[#FAF8FE] hover:bg-[#EFEAF9] border-t border-[#EFEAF9] text-xs font-semibold text-[#3B1D6E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View all {matchingProducts.length} results in Essentials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile/Tablet Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setMobileMenuOpen(false);
              setAccountMenuOpen(false);
            }}
            aria-label={mobileSearchOpen ? 'Close product search' : 'Search products'}
            aria-expanded={mobileSearchOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E4DCF4] text-[#2A1254] hover:bg-[#F7F5FC] transition-colors cursor-pointer"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Sign In / Account Control */}
          {authReady && !user && (
            <button
              type="button"
              onClick={onSignIn}
              disabled={authBusy}
              aria-label="Sign in with Google"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-[#D4C7F0] bg-[#FAF8FE] hover:bg-[#EFEAF9] text-[#2A1254] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#3B1D6E]" strokeWidth={2} />
              <span>{authBusy ? 'Signing in...' : 'Sign In'}</span>
            </button>
          )}

          {authReady && user && (
            <div ref={accountContainerRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((prev) => !prev);
                  setDropdownOpen(false);
                  setMobileSearchOpen(false);
                }}
                aria-label="Open account menu"
                aria-expanded={accountMenuOpen}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDD4F2] bg-[#FAF8FE] hover:bg-[#EFEAF9] text-[#2A1254] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B1D6E] cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Student avatar'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-[#D4C7F0]"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#3B1D6E] text-white text-xs font-bold inline-flex items-center justify-center">
                    {userInitial}
                  </span>
                )}
                <span className="hidden sm:inline max-w-[96px] truncate">{userFirstName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B5E84] hidden sm:inline" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E4DCF4] shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-[#FAF8FE] border-b border-[#EFEAF9]">
                    <p className="text-sm font-semibold text-[#2A1254] truncate">
                      {user.displayName || 'CampusEase Student'}
                    </p>
                    <p className="text-xs text-[#6B5E84] truncate mt-0.5">{user.email}</p>
                    {isAdmin && (
                      <p className="mt-1.5 text-[11px] font-semibold text-[#0369A1] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Campus Admin</span>
                      </p>
                    )}
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavClick('student')}
                      className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-[#2A1254] hover:bg-[#F7F5FC] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#6B5E84]" />
                      <span>Student Hub &amp; Orders</span>
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-[#2A1254] hover:bg-[#F7F5FC] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0369A1]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary Action: Cart */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${cartCount} items`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#3B1D6E] hover:bg-[#2A1254] text-white text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B1D6E] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Cart</span>
            <span className="tabular-nums font-semibold text-[#BAE6FD]">({cartCount})</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setMobileSearchOpen(false);
              setAccountMenuOpen(false);
            }}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#E4DCF4] text-[#2A1254] hover:bg-[#F7F5FC] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Panel for Mobile & Tablet */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-white border-t border-[#E8E2F4] px-4 py-3 shadow-lg">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A6F93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search notebooks, snacks, shampoo, first aid..."
                aria-label="Search products across all categories"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#DDD4F2] bg-[#FAF8FE] focus:bg-white text-sm text-[#1A132B] focus:outline-none focus:ring-2 focus:ring-[#3B1D6E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7A6F93] hover:text-[#2A1254]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#3B1D6E] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {trimmedQuery.length > 0 && (
            <div className="mt-2.5 border-t border-[#EFEAF9] pt-2">
              {matchingProducts.length === 0 ? (
                <p className="text-xs text-[#6B5E84] py-2 text-center">
                  No products matching &ldquo;{searchQuery.trim()}&rdquo;.
                </p>
              ) : (
                <ul className="divide-y divide-[#EFEAF9] max-h-60 overflow-y-auto">
                  {matchingProducts.slice(0, 5).map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => handlePickProduct(product)}
                        className="w-full py-2 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#2A1254] truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-[#6B5E84] truncate">{product.category}</p>
                        </div>
                        <span className="font-display text-xs font-bold text-[#2A1254] tabular-nums shrink-0">
                          ₹{product.price}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

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

          {authReady && (
            <div className="pt-2 mt-2 border-t border-[#EFEAF9]">
              {!user ? (
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignIn();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#FAF8FE] border border-[#DDD4F2] text-sm font-semibold text-[#2A1254] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4 text-[#3B1D6E]" />
                  <span>{authBusy ? 'Signing in...' : 'Sign In with Google'}</span>
                </button>
              ) : (
                <div className="px-3 py-2 rounded-lg bg-[#FAF8FE] border border-[#EFEAF9] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#2A1254] truncate">
                      {user.displayName || 'Signed In'}
                    </p>
                    <p className="text-[11px] text-[#6B5E84] truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

