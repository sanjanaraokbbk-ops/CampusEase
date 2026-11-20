import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_STUDENT_PROFILE,
  DELIVERY_FEES,
  INITIAL_PRODUCTS,
} from '../data/catalog';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
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

const CART_STORAGE_KEY = 'campusease_cart_v1';

function readLocalCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage quota errors
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

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && 'toDate' in value) {
    const maybeFn = (value as { toDate?: () => Date }).toDate;
    if (typeof maybeFn === 'function') {
      return maybeFn().toISOString();
    }
  }
  return new Date().toISOString();
}

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
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
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [firestoreProductOverrides, setFirestoreProductOverrides] = useState<
    Record<string, Partial<Product>>
  >({});
  const [cart, setCart] = useState<CartItem[]>(() => readLocalCart());
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [hasStoredProfile, setHasStoredProfile] = useState(false);
  const [profileCreatedAt, setProfileCreatedAt] = useState<Timestamp | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Persist shopping cart locally so browsing works seamlessly before sign-in and across reloads
  useEffect(() => {
    writeLocalCart(cart);
  }, [cart]);

  // 1. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError(null);

      if (!nextUser) {
        setIsAdmin(false);
        setOrders([]);
        setBookings([]);
        setProfile(DEFAULT_STUDENT_PROFILE);
        setHasStoredProfile(false);
        setProfileCreatedAt(null);
        setAuthReady(true);
        setDataLoading(false);
        return;
      }

      const bootstrapped =
        Boolean(nextUser.emailVerified) && nextUser.email === BOOTSTRAPPED_ADMIN_EMAIL;

      if (bootstrapped) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      // Check trusted /admins/{uid} collection
      try {
        const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Public Firestore catalog overrides listener (/products)
  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      where('available', 'in', [true, false])
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const overrides: Record<string, Partial<Product>> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          overrides[docSnap.id] = {
            available: Boolean(data.available),
            price: typeof data.price === 'number' ? data.price : undefined,
          };
        });
        setFirestoreProductOverrides(overrides);
      },
      (error) => {
        // Surface permission or configuration errors cleanly
        setSyncError(error.message);
        console.error('Products listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Authenticated Firestore listeners (/users/{uid}, /orders, /bookings)
  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    setDataLoading(true);
    setSyncError(null);

    // Profile listener
    const profileRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setHasStoredProfile(true);
          setProfileCreatedAt(data.createdAt instanceof Timestamp ? data.createdAt : null);
          setProfile({
            name: String(data.name || user.displayName || DEFAULT_STUDENT_PROFILE.name),
            studentId: String(data.studentId || DEFAULT_STUDENT_PROFILE.studentId),
            program: String(data.program || DEFAULT_STUDENT_PROFILE.program),
            mobile: String(data.mobile || DEFAULT_STUDENT_PROFILE.mobile),
            email: String(data.email || user.email || DEFAULT_STUDENT_PROFILE.email),
            defaultLocation: String(
              data.defaultLocation || DEFAULT_STUDENT_PROFILE.defaultLocation
            ),
          });
        } else {
          setHasStoredProfile(false);
          setProfileCreatedAt(null);
          setProfile({
            ...DEFAULT_STUDENT_PROFILE,
            name: user.displayName || DEFAULT_STUDENT_PROFILE.name,
            email: user.email || DEFAULT_STUDENT_PROFILE.email,
          });
        }
      },
      (error) => {
        setSyncError(error.message);
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    // Orders listener (Admin sees all orders; Students see their own orders enforced by rules)
    const ordersQuery = isAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('userId', '==', user.uid));

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const loaded: Order[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data();
            return {
              id: String(d.id || docSnap.id),
              userId: String(d.userId || ''),
              createdAt: timestampToIso(d.createdAt),
              studentName: String(d.studentName || ''),
              mobile: String(d.mobile || ''),
              email: String(d.email || ''),
              location: String(d.location || ''),
              fulfillmentMethod: d.fulfillmentMethod as FulfillmentMethod,
              notes: String(d.notes || ''),
              items: Array.isArray(d.items) ? (d.items as OrderLineItem[]) : [],
              subtotal: Number(d.subtotal || 0),
              convenienceFee: Number(d.convenienceFee || 0),
              total: Number(d.total || 0),
              status: d.status as OrderStatus,
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(loaded);
        setDataLoading(false);
      },
      (error) => {
        setDataLoading(false);
        setSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );

    // Bookings listener (Admin sees all bookings; Students see their own bookings enforced by rules)
    const bookingsQuery = isAdmin
      ? collection(db, 'bookings')
      : query(collection(db, 'bookings'), where('userId', '==', user.uid));

    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const loaded: ServiceBooking[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data();
            return {
              id: String(d.id || docSnap.id),
              userId: String(d.userId || ''),
              createdAt: timestampToIso(d.createdAt),
              serviceId: String(d.serviceId || ''),
              serviceName: String(d.serviceName || ''),
              servicePrice: Number(d.servicePrice || 0),
              servicePriceUnit: String(d.servicePriceUnit || ''),
              preferredDate: String(d.preferredDate || ''),
              preferredTime: String(d.preferredTime || ''),
              studentName: String(d.studentName || ''),
              mobile: String(d.mobile || ''),
              email: String(d.email || ''),
              location: String(d.location || ''),
              notes: String(d.notes || ''),
              status: d.status as BookingStatus,
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setBookings(loaded);
      },
      (error) => {
        setSyncError(error.message);
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );

    return () => {
      unsubProfile();
      unsubOrders();
      unsubBookings();
    };
  }, [authReady, user, isAdmin]);

  // Merge catalog with live Firestore availability overrides
  const products: Product[] = useMemo(() => {
    return INITIAL_PRODUCTS.map((item) => {
      const override = firestoreProductOverrides[item.id];
      if (!override) return item;
      return {
        ...item,
        available: typeof override.available === 'boolean' ? override.available : item.available,
        price: typeof override.price === 'number' ? override.price : item.price,
      };
    });
  }, [firestoreProductOverrides]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

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
    (productId: string) => cart.find((item) => item.productId === productId)?.quantity ?? 0,
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
        // Keep cart strictly within blueprint's 20-line-item limit
        if (prev.length >= 20) return prev;
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

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      if (!msg.includes('popup-closed-by-user')) {
        setAuthError(msg);
      }
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    try {
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const saveProfileToFirestore = useCallback(
    async (nextProfile: StudentProfile) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const sanitized: StudentProfile = {
        name: sanitizeText(nextProfile.name || currentUser.displayName || 'Student', 100),
        studentId: sanitizeText(nextProfile.studentId || DEFAULT_STUDENT_PROFILE.studentId, 40),
        program: sanitizeText(nextProfile.program || DEFAULT_STUDENT_PROFILE.program, 120),
        mobile: nextProfile.mobile.replace(/\D/g, '').slice(0, 10),
        email: sanitizeText(nextProfile.email || currentUser.email || '', 120),
        defaultLocation: sanitizeText(
          nextProfile.defaultLocation || DEFAULT_STUDENT_PROFILE.defaultLocation,
          150
        ),
      };

      // Validate 10-digit mobile and email before writing to satisfy strict rules
      if (!/^[0-9]{10}$/.test(sanitized.mobile) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
        return;
      }

      const path = `users/${currentUser.uid}`;
      try {
        if (hasStoredProfile && profileCreatedAt) {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            ...sanitized,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, 'users', currentUser.uid), {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [hasStoredProfile, profileCreatedAt]
  );

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<Order | null> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const availableItems = cartItems.filter((item) => item.product.available).slice(0, 20);
      if (availableItems.length === 0) return null;

      const orderItems: OrderLineItem[] = availableItems.map((item) => ({
        productId: item.product.id,
        name: sanitizeText(item.product.name, 120),
        category: item.product.category,
        unit: sanitizeText(item.product.unit, 60),
        price: item.product.price,
        quantity: Math.min(20, Math.max(1, Math.floor(item.quantity))),
        image: sanitizeText(item.product.image, 250),
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const convenienceFee = DELIVERY_FEES[input.fulfillmentMethod];
      const total = subtotal + convenienceFee;

      const orderId = generateReference(
        'CE-ORD',
        orders.map((o) => o.id)
      );

      const cleanStudentName = sanitizeText(input.studentName, 100);
      const cleanMobile = input.mobile.replace(/\D/g, '').slice(0, 10);
      const cleanEmail = sanitizeText(input.email, 120);
      const cleanLocation = sanitizeText(input.location, 150);
      const cleanNotes = sanitizeText(input.notes, 400);

      const path = `orders/${orderId}`;
      try {
        await setDoc(doc(db, 'orders', orderId), {
          id: orderId,
          userId: currentUser.uid,
          studentName: cleanStudentName,
          mobile: cleanMobile,
          email: cleanEmail,
          location: cleanLocation,
          fulfillmentMethod: input.fulfillmentMethod,
          notes: cleanNotes,
          items: orderItems,
          subtotal,
          convenienceFee,
          total,
          status: OrderStatus.ORDER_PLACED,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      setCart([]);

      // Best-effort sync of student profile defaults
      saveProfileToFirestore({
        ...profile,
        name: cleanStudentName,
        mobile: cleanMobile,
        email: cleanEmail,
        defaultLocation: cleanLocation,
      }).catch(() => undefined);

      return {
        id: orderId,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        studentName: cleanStudentName,
        mobile: cleanMobile,
        email: cleanEmail,
        location: cleanLocation,
        fulfillmentMethod: input.fulfillmentMethod,
        notes: cleanNotes,
        items: orderItems,
        subtotal,
        convenienceFee,
        total,
        status: OrderStatus.ORDER_PLACED,
      };
    },
    [cartItems, orders, profile, saveProfileToFirestore]
  );

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, []);

  const createServiceBooking = useCallback(
    async (input: CreateBookingInput): Promise<ServiceBooking | null> => {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const bookingId = generateReference(
        'CE-SRV',
        bookings.map((b) => b.id)
      );

      const cleanStudentName = sanitizeText(input.studentName, 100);
      const cleanMobile = input.mobile.replace(/\D/g, '').slice(0, 10);
      const cleanEmail = sanitizeText(input.email, 120);
      const cleanLocation = sanitizeText(input.location, 150);
      const cleanNotes = sanitizeText(input.notes, 400);

      const path = `bookings/${bookingId}`;
      try {
        await setDoc(doc(db, 'bookings', bookingId), {
          id: bookingId,
          userId: currentUser.uid,
          serviceId: sanitizeText(input.serviceId, 40),
          serviceName: sanitizeText(input.serviceName, 120),
          servicePrice: input.servicePrice,
          servicePriceUnit: sanitizeText(input.servicePriceUnit, 60),
          preferredDate: input.preferredDate,
          preferredTime: sanitizeText(input.preferredTime, 40),
          studentName: cleanStudentName,
          mobile: cleanMobile,
          email: cleanEmail,
          location: cleanLocation,
          notes: cleanNotes,
          status: BookingStatus.REQUESTED,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      saveProfileToFirestore({
        ...profile,
        name: cleanStudentName,
        mobile: cleanMobile,
        email: cleanEmail,
        defaultLocation: cleanLocation,
      }).catch(() => undefined);

      return {
        id: bookingId,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        serviceId: input.serviceId,
        serviceName: input.serviceName,
        servicePrice: input.servicePrice,
        servicePriceUnit: input.servicePriceUnit,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        studentName: cleanStudentName,
        mobile: cleanMobile,
        email: cleanEmail,
        location: cleanLocation,
        notes: cleanNotes,
        status: BookingStatus.REQUESTED,
      };
    },
    [bookings, profile, saveProfileToFirestore]
  );

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    const path = `bookings/${bookingId}`;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, []);

  const toggleProductAvailability = useCallback(
    async (productId: string) => {
      const current = productMap.get(productId);
      if (!current) return;

      const path = `products/${productId}`;
      const payload: Record<string, unknown> = {
        id: current.id,
        name: sanitizeText(current.name, 120),
        category: current.category,
        price: current.price,
        unit: sanitizeText(current.unit, 60),
        description: sanitizeText(current.description, 500),
        image: sanitizeText(current.image, 250),
        available: !current.available,
        updatedAt: serverTimestamp(),
      };
      if (typeof current.popular === 'boolean') payload.popular = current.popular;
      if (typeof current.otcNotice === 'boolean') payload.otcNotice = current.otcNotice;

      try {
        await setDoc(doc(db, 'products', productId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [productMap]
  );

  const syncCatalogToFirestore = useCallback(async () => {
    const batch = writeBatch(db);
    for (const item of INITIAL_PRODUCTS) {
      const payload: Record<string, unknown> = {
        id: item.id,
        name: sanitizeText(item.name, 120),
        category: item.category,
        price: item.price,
        unit: sanitizeText(item.unit, 60),
        description: sanitizeText(item.description, 500),
        image: sanitizeText(item.image, 250),
        available: item.available,
        updatedAt: serverTimestamp(),
      };
      if (typeof item.popular === 'boolean') payload.popular = item.popular;
      if (typeof item.otcNotice === 'boolean') payload.otcNotice = item.otcNotice;

      batch.set(doc(db, 'products', item.id), payload);
    }

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  }, []);

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((o) => o.userId === user.uid);
  }, [orders, user]);

  const myBookings = useMemo(() => {
    if (!user) return [];
    return bookings.filter((b) => b.userId === user.uid);
  }, [bookings, user]);

  return {
    user,
    authReady,
    authBusy,
    authError,
    isAdmin,
    dataLoading,
    syncError,
    products,
    cartItems,
    cartCount,
    cartSubtotal,
    orders,
    myOrders,
    bookings,
    myBookings,
    profile,
    signInWithGoogle,
    signOutUser,
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
    updateProfile: saveProfileToFirestore,
    syncCatalogToFirestore,
  };
}
