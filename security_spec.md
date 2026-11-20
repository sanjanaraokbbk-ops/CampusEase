# CampusEase Firestore Security Specification (Phase 0)

## 1. Data Invariants

1. **Identity Ownership**: Every document in `/orders/{orderId}` and `/bookings/{bookingId}` MUST have `userId == request.auth.uid` on creation and `userId` MUST remain immutable on every subsequent update.
2. **PII Isolation**: `/users/{userId}`, `/orders/{orderId}`, and `/bookings/{bookingId}` contain student PII (`email`, `mobile`, `location`). Reads (`get` and `list`) are strictly restricted to the owning user (`userId == request.auth.uid`) or a verified administrator (`isAdmin()`).
3. **No Self-Assigned Admin**: Users cannot create or mutate `/admins/{adminId}` and cannot inject `role` or `isAdmin` fields into `/users/{userId}`. Admin status requires either verified email matching the bootstrapped admin or an out-of-band `/admins/{uid}` record.
4. **Strict Schema & Bounded Arrays**: Every write validates required/allowed keys via `hasAll` + `hasOnly`, enforces `.size()` limits on every string, enforces regex patterns on IDs, dates, and 10-digit phone numbers, and bounds `orders.items` to 1–20 validated entries.
5. **Temporal Integrity & Immutability**: `createdAt == request.time` on create and remains immutable forever (`incoming().createdAt == existing().createdAt`). `updatedAt == request.time` on create and update.
6. **State Progression & Terminal Lock**: Orders must start at `'Order Placed'` and bookings at `'Requested'`. Non-admin order owners may only advance simulated status one step forward (`Order Placed -> Preparing -> Ready for Pickup -> Completed`) and cannot modify an order once `'Completed'`. Only verified admins can manage arbitrary order/booking statuses or product inventory.

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Collection | Adversarial Payload / Action | Expected Result |
|---|---------------|-------------------|------------------------------|-----------------|
| 1 | Identity Spoofing | `/orders/CE-ORD-9999` | Authenticated User A creates an order with `userId: "user_B"` | `PERMISSION_DENIED` |
| 2 | Shadow Field / Role Escalation | `/users/user_A` | User A creates/updates profile with extra ghost field `isAdmin: true` | `PERMISSION_DENIED` |
| 3 | Unverified Email Admin Spoof | `/products/prod-st-1` | Token with admin email but `email_verified: false` attempts product update | `PERMISSION_DENIED` |
| 4 | Cross-User PII Read | `/users/user_B` | User A attempts `get` on User B's profile containing mobile & email | `PERMISSION_DENIED` |
| 5 | Unscoped List Scraping | `/orders` | User A issues `list` query without `where('userId', '==', uid)` | `PERMISSION_DENIED` |
| 6 | State Shortcutting | `/orders/CE-ORD-1001` | User A creates an order directly with `status: "Completed"` | `PERMISSION_DENIED` |
| 7 | Terminal State Tampering | `/orders/CE-ORD-1002` | User A updates an already `'Completed'` order back to `'Preparing'` | `PERMISSION_DENIED` |
| 8 | Client Timestamp Forgery | `/bookings/CE-SRV-1001` | User A submits a backdated `createdAt` timestamp instead of `serverTimestamp()` | `PERMISSION_DENIED` |
| 9 | Path ID Poisoning | `/orders/../../evil$id!` | User A attempts write with invalid characters or 150-char document ID | `PERMISSION_DENIED` |
| 10 | Total Mismatch Tampering | `/orders/CE-ORD-1003` | User A submits `subtotal: 200, convenienceFee: 25, total: 1` | `PERMISSION_DENIED` |
| 11 | Unbounded Array Exhaustion | `/orders/CE-ORD-1004` | User A submits `items` array with 25 entries (exceeding max 20) | `PERMISSION_DENIED` |
| 12 | Non-Admin Inventory Mutation | `/products/prod-st-1` | Regular verified student toggles `available: false` on a catalog product | `PERMISSION_DENIED` |
