/**
 * CampusEase Firestore Security Rules Test Specification (Phase 0 TDD)
 * Verifies all 12 "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED
 * against firestore.rules when executed under the Firebase Rules Unit Testing emulator.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  actor: 'userA' | 'unverifiedAdminSpoof' | 'anonymous';
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedByRule: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Order Create',
    operation: 'create',
    path: '/orders/CE-ORD-9999',
    actor: 'userA',
    payload: { id: 'CE-ORD-9999', userId: 'userB', status: 'Order Placed' },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().userId == request.auth.uid',
  },
  {
    id: 2,
    name: 'Shadow Field / Privilege Escalation on Profile',
    operation: 'update',
    path: '/users/userA',
    actor: 'userA',
    payload: { name: 'Aarav', isAdmin: true },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'data.keys().hasOnly(...) && affectedKeys().hasOnly(...)',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof on Product Write',
    operation: 'update',
    path: '/products/prod-st-1',
    actor: 'unverifiedAdminSpoof',
    payload: { available: false },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'request.auth.token.email_verified == true in isAdmin()',
  },
  {
    id: 4,
    name: 'Cross-User PII Profile Read',
    operation: 'get',
    path: '/users/userB',
    actor: 'userA',
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'isOwner(userId) || isAdmin()',
  },
  {
    id: 5,
    name: 'Unscoped Orders Collection List Scraping',
    operation: 'list',
    path: '/orders',
    actor: 'userA',
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'resource.data.userId == request.auth.uid || isAdmin()',
  },
  {
    id: 6,
    name: 'Order Status Shortcutting on Create',
    operation: 'create',
    path: '/orders/CE-ORD-1001',
    actor: 'userA',
    payload: { id: 'CE-ORD-1001', userId: 'userA', status: 'Completed' },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: "incoming().status == 'Order Placed'",
  },
  {
    id: 7,
    name: 'Terminal Order State Tampering',
    operation: 'update',
    path: '/orders/CE-ORD-1002',
    actor: 'userA',
    payload: { status: 'Preparing' },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: "existing().status != 'Completed' && isValidOrderStatusStep(...)",
  },
  {
    id: 8,
    name: 'Client Timestamp Forgery on Booking Create',
    operation: 'create',
    path: '/bookings/CE-SRV-1001',
    actor: 'userA',
    payload: { id: 'CE-SRV-1001', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'incoming().createdAt == request.time',
  },
  {
    id: 9,
    name: 'Path ID Poisoning',
    operation: 'create',
    path: '/orders/evil$id!with_bad_chars',
    actor: 'userA',
    expected: 'PERMISSION_DENIED',
    enforcedByRule: "isValidId(orderId) matching '^[a-zA-Z0-9_\\\\-]+$'",
  },
  {
    id: 10,
    name: 'Price Total Arithmetic Tampering',
    operation: 'create',
    path: '/orders/CE-ORD-1003',
    actor: 'userA',
    payload: { subtotal: 200, convenienceFee: 25, total: 1 },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'data.total == data.subtotal + data.convenienceFee',
  },
  {
    id: 11,
    name: 'Unbounded Items Array Exhaustion',
    operation: 'create',
    path: '/orders/CE-ORD-1004',
    actor: 'userA',
    payload: { items: Array.from({ length: 25 }, () => ({ name: 'Item' })) },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'data.items.size() >= 1 && data.items.size() <= 20',
  },
  {
    id: 12,
    name: 'Non-Admin Product Availability Mutation',
    operation: 'update',
    path: '/products/prod-st-1',
    actor: 'userA',
    payload: { available: false },
    expected: 'PERMISSION_DENIED',
    enforcedByRule: 'isAdmin() required for /products writes',
  },
];
