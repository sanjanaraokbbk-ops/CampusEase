import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_STUDENT_PROFILE,
  DELIVERY_FEES,
  INITIAL_PRODUCTS,
  SEEDED_DEMO_BOOKINGS,
  SEEDED_DEMO_ORDERS,
} from '../data/catalog';
import {
  BookingStatus,
  CartItem,
  FulfillmentMethod,
  Order,
  OrderLineItem,
  OrderStatus,
  Product,
  ServiceBooking,
  StudentProfile,
} from '../types/campus';

const STORAGE_KEYS = {
  products: 'campusease_products_v1',
  cart: 'campusease_cart_v1',
  orders: 'campusease_orders_v1',
  bookings: 'campusease_bookings_v1',
  profile: 'campusease_profile_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

function generateReference(prefix: 'CE-ORD' | 'CE-SRV', existingIds: string[]): string {
  const existing = new Set(existingIds);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${prefix}-${num}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
  }
  return `${prefix}-${Date.now().toString().slice(-5)}`;
}

export interface PlaceOrderInput {
  studentName: string;
  mobile: string;
  email: string;
  location: string;
  fulfillmentMethod: FulfillmentMethod;
  notes: string;
}

export interface CreateBookingInput {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  servicePriceUnit: string;
  preferredDate: string;
  preferredTime: string;
  studentName: string;
  mobile: string;
  email: string;
  location: string;
  notes: string;
}

export interface CartDetailedItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export function useCampusStore() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = readStorage<Product[] | null>(STORAGE_KEYS.products, null);
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      return INITIAL_PRODUCTS;
    }
    // Keep any updated availability while preserving accurate image paths from INITIAL_PRODUCTS
    const availabilityMap = new Map(saved.map((p) => [p.id, p.available]));
    return INITIAL_PRODUCTS.map((p) => ({
      ...p,
      available: availabilityMap.has(p.id) ? Boolean(availabilityMap.get(p.id)) : p.available,
    }));
  });

  const [cart, setCart] = useState<CartItem[]>(() => readStorage<CartItem[]>(STORAGE_KEYS.cart, []));
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage<Order[]>(STORAGE_KEYS.orders, SEEDED_DEMO_ORDERS)
  );
  const [bookings, setBookings] = useState<ServiceBooking[]>(() =>
    readStorage<ServiceBooking[]>(STORAGE_KEYS.bookings, SEEDED_DEMO_BOOKINGS)
  );
  const [profile, setProfile] = useState<StudentProfile>(() =>
    readStorage<StudentProfile>(STORAGE_KEYS.profile, DEFAULT_STUDENT_PROFILE)
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.orders, orders);
  }, [orders]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.profile, profile);
  }, [profile]);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const cartItems: CartDetailedItem[] = useMemo(() => {
    return cart
      .map((entry) => {
        const product = productMap.get(entry.productId);
        if (!product || entry.quantity <= 0) return null;
        return {
          product,
          quantity: entry.quantity,
          lineTotal: product.price * entry.quantity,
        };
      })
      .filter((item): item is CartDetailedItem => item !== null);
  }, [cart, productMap]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const getProductQuantity = useCallback(
    (productId: string) => {
      return cart.find((item) => item.productId === productId)?.quantity ?? 0;
    },
    [cart]
  );

  const addToCart = useCallback(
    (productId: string, delta = 1) => {
      const target = productMap.get(productId);
      if (!target || !target.available) return false;
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(20, item.quantity + delta) }
              : item
          );
        }
        return [...prev, { productId, quantity: Math.max(1, delta) }];
      });
      return true;
    },
    [productMap]
  );

  const updateCartQuantity = useCallback((productId: string, nextQuantity: number) => {
    setCart((prev) => {
      if (nextQuantity <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(20, nextQuantity) }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order | null => {
      const availableItems = cartItems.filter((item) => item.product.available);
      if (availableItems.length === 0) return null;

      const orderItems: OrderLineItem[] = availableItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const convenienceFee = DELIVERY_FEES[input.fulfillmentMethod];
      const total = subtotal + convenienceFee;

      const newOrder: Order = {
        id: generateReference(
          'CE-ORD',
          orders.map((o) => o.id)
        ),
        createdAt: new Date().toISOString(),
        studentName: input.studentName.trim(),
        mobile: input.mobile.trim(),
        email: input.email.trim(),
        location: input.location,
        fulfillmentMethod: input.fulfillmentMethod,
        notes: input.notes.trim(),
        items: orderItems,
        subtotal,
        convenienceFee,
        total,
        status: OrderStatus.ORDER_PLACED,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setProfile((prev) => ({
        ...prev,
        name: input.studentName.trim() || prev.name,
        mobile: input.mobile.trim() || prev.mobile,
        email: input.email.trim() || prev.email,
        defaultLocation: input.location || prev.defaultLocation,
      }));

      return newOrder;
    },
    [cartItems, orders]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);

  const createServiceBooking = useCallback(
    (input: CreateBookingInput): ServiceBooking => {
      const newBooking: ServiceBooking = {
        id: generateReference(
          'CE-SRV',
          bookings.map((b) => b.id)
        ),
        createdAt: new Date().toISOString(),
        serviceId: input.serviceId,
        serviceName: input.serviceName,
        servicePrice: input.servicePrice,
        servicePriceUnit: input.servicePriceUnit,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        studentName: input.studentName.trim(),
        mobile: input.mobile.trim(),
        email: input.email.trim(),
        location: input.location,
        notes: input.notes.trim(),
        status: BookingStatus.REQUESTED,
      };

      setBookings((prev) => [newBooking, ...prev]);
      setProfile((prev) => ({
        ...prev,
        name: input.studentName.trim() || prev.name,
        mobile: input.mobile.trim() || prev.mobile,
        email: input.email.trim() || prev.email,
        defaultLocation: input.location || prev.defaultLocation,
      }));

      return newBooking;
    },
    [bookings]
  );

  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
    );
  }, []);

  const toggleProductAvailability = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, available: !p.available } : p))
    );
  }, []);

  const updateProfile = useCallback((nextProfile: StudentProfile) => {
    setProfile(nextProfile);
  }, []);

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setOrders(SEEDED_DEMO_ORDERS);
    setBookings(SEEDED_DEMO_BOOKINGS);
    setProfile(DEFAULT_STUDENT_PROFILE);
  }, []);

  return {
    products,
    cartItems,
    cartCount,
    cartSubtotal,
    orders,
    bookings,
    profile,
    getProductQuantity,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    updateOrderStatus,
    createServiceBooking,
    updateBookingStatus,
    toggleProductAvailability,
    updateProfile,
    resetDemoData,
  };
}
