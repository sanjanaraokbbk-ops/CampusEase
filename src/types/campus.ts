export enum ProductCategory {
  STATIONERY = 'Stationery',
  SNACKS = 'Snacks & Beverages',
  PERSONAL_CARE = 'Personal Care',
  MEDICINES = 'Medicines & First Aid',
}

export enum FulfillmentMethod {
  HOSTEL_DELIVERY = 'hostel_delivery',
  CAMPUS_PICKUP = 'campus_pickup',
}

export enum OrderStatus {
  ORDER_PLACED = 'Order Placed',
  PREPARING = 'Preparing',
  READY_FOR_PICKUP = 'Ready for Pickup',
  COMPLETED = 'Completed',
}

export enum BookingStatus {
  REQUESTED = 'Requested',
  CONFIRMED = 'Confirmed',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export type PageView =
  | 'home'
  | 'essentials'
  | 'services'
  | 'checkout'
  | 'order-confirmation'
  | 'student'
  | 'admin';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  description: string;
  image: string;
  available: boolean;
  popular?: boolean;
  otcNotice?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderLineItem {
  productId: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  studentName: string;
  mobile: string;
  email: string;
  location: string;
  fulfillmentMethod: FulfillmentMethod;
  notes: string;
  items: OrderLineItem[];
  subtotal: number;
  convenienceFee: number;
  total: number;
  status: OrderStatus;
  isDemoSample?: boolean;
}

export interface CampusService {
  id: string;
  name: string;
  shortTag: string;
  description: string;
  turnaround: string;
  price: number;
  priceUnit: string;
  availabilityNote: string;
  highlights: string[];
}

export interface ServiceBooking {
  id: string;
  userId?: string;
  createdAt: string;
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
  status: BookingStatus;
  isDemoSample?: boolean;
}

export interface StudentProfile {
  name: string;
  studentId: string;
  program: string;
  mobile: string;
  email: string;
  defaultLocation: string;
}
