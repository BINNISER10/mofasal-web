# MUFASAL API Documentation

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:4000/api` |
| Staging | `https://staging-api.mufasal.com/api` |
| Production | `https://api.mufasal.com/api` |

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/auth/login` or `/auth/register` endpoints. Access tokens expire after 15 minutes; use the refresh token to obtain a new one.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error description",
    "details": []
  }
}
```

### Success Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## 1. Authentication Module

### 1.1 Register

Creates a new user account.

**`POST /auth/register`**

**Access:** Public

**Request Body:**
```json
{
  "phone": "+966500000000",
  "password": "SecurePass123!",
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "phone": "+966500000000", "name": "Ahmed Ali", "role": "customer" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 1.2 Login

**`POST /auth/login`**

**Access:** Public

**Request Body:**
```json
{
  "phone": "+966500000000",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {},
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 1.3 Refresh Token

**`POST /auth/refresh`**

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
}
```

### 1.4 Logout

**`POST /auth/logout`**

**Access:** Authenticated

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

### 1.5 Send OTP

**`POST /auth/send-otp`**

**Access:** Public

**Request Body:**
```json
{ "phone": "+966500000000" }
```

**Response (200):**
```json
{ "success": true, "data": { "message": "OTP sent", "expiresIn": 300 } }
```

### 1.6 Verify OTP

**`POST /auth/verify-otp`**

**Access:** Public

**Request Body:**
```json
{ "phone": "+966500000000", "otp": "123456" }
```

**Response (200):**
```json
{ "success": true, "data": { "verified": true } }
```

### 1.7 Firebase Login

**`POST /auth/firebase`**

**Access:** Public

**Request Body:**
```json
{ "idToken": "firebase-id-token" }
```

**Response (200):**
```json
{ "success": true, "data": { "user": {}, "accessToken": "", "refreshToken": "" } }
```

---

## 2. User / Profile Module

### 2.1 Get Profile

**`GET /users/me`**

**Access:** Authenticated

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ahmed Ali",
    "phone": "+966500000000",
    "email": "ahmed@example.com",
    "role": "customer",
    "avatar": "https://cdn.mufasal.com/avatars/uuid.jpg",
    "addresses": [],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### 2.2 Update Profile

**`PATCH /users/me`**

**Access:** Authenticated | Roles: customer, driver, admin

**Request Body:**
```json
{
  "name": "Ahmed Abdullah",
  "email": "ahmed.abdullah@example.com",
  "avatar": "base64-image-string"
}
```

### 2.3 Get Addresses

**`GET /users/me/addresses`**

**Access:** Authenticated

### 2.4 Create Address

**`POST /users/me/addresses`**

**Access:** Authenticated

**Request Body:**
```json
{
  "label": "Home",
  "street": "King Fahd Road",
  "district": "Al Olaya",
  "city": "Riyadh",
  "building": "1234",
  "apartment": "5B",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "isDefault": true
}
```

### 2.5 Delete Address

**`DELETE /users/me/addresses/:addressId`**

**Access:** Authenticated

---

## 3. Orders Module

### 3.1 Create Order

**`POST /orders`**

**Access:** Authenticated | Role: customer

**Request Body:**
```json
{
  "vendorId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2, "notes": "No onions" }
  ],
  "deliveryAddressId": "uuid",
  "paymentMethod": "mada",
  "scheduledAt": "2025-01-02T14:00:00Z",
  "notes": "Call before delivery"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "total": 89.50,
    "estimatedDelivery": "2025-01-02T14:30:00Z",
    "paymentUrl": "https://checkout.stcpay.com.sa/..."
  }
}
```

### 3.2 Get Orders (Customer)

**`GET /orders?page=1&limit=20&status=ACTIVE`**

**Access:** Authenticated | Role: customer

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter: ACTIVE, COMPLETED, CANCELLED, ALL |
| from | ISO date | Start date filter |
| to | ISO date | End date filter |

### 3.3 Get Order by ID

**`GET /orders/:orderId`**

**Access:** Authenticated | Roles: customer (own), admin

### 3.4 Cancel Order

**`POST /orders/:orderId/cancel`**

**Access:** Authenticated | Role: customer

**Request Body:**
```json
{ "reason": "Changed my mind" }
```

### 3.5 Rate Order

**`POST /orders/:orderId/rate`**

**Access:** Authenticated | Role: customer

**Request Body:**
```json
{ "rating": 5, "comment": "Excellent service!" }
```

### 3.6 Track Order (WebSocket)

**`socket.io` Namespace:** `/orders`
**Event:** `order:track`

**Client → Server:**
```json
{ "event": "order:track", "data": { "orderId": "uuid" } }
```

**Server → Client (real-time):**
```json
{
  "event": "order:update",
  "data": {
    "orderId": "uuid",
    "status": "ASSIGNED",
    "driver": { "name": "Khalid", "phone": "+966500000001" },
    "location": { "latitude": 24.7136, "longitude": 46.6753 }
  }
}
```

---

## 4. Vendor Module

### 4.1 List Vendors

**`GET /vendors?page=1&limit=20&category=food&lat=24.71&lng=46.67`**

**Access:** Authenticated

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |
| search | string | Search by name |
| lat/lng | float | Sort by proximity |
| radius | number | Search radius in km (default: 25) |
| openNow | boolean | Only show currently open vendors |

### 4.2 Get Vendor

**`GET /vendors/:vendorId`**

**Access:** Authenticated

### 4.3 Get Vendor Products

**`GET /vendors/:vendorId/products?category=drinks`**

**Access:** Authenticated

### 4.4 Get Vendor Menu (Grouped)

**`GET /vendors/:vendorId/menu`**

**Access:** Authenticated

### 4.5 Create Vendor (Admin)

**`POST /vendors`**

**Access:** Authenticated | Role: admin

**Request Body:**
```json
{
  "name": "Mandi House",
  "nameAr": "مندي هاوس",
  "category": "food",
  "phone": "+966500000002",
  "city": "Riyadh",
  "latitude": 24.7136,
  "longitude": 46.6753,
  "image": "https://cdn.mufasal.com/vendors/uuid.jpg",
  "commission": 15,
  "isActive": true
}
```

### 4.6 Update Vendor

**`PATCH /vendors/:vendorId`**

**Access:** Authenticated | Role: admin

### 4.7 Manage Vendor Hours

**`PUT /vendors/:vendorId/hours`**

**Access:** Authenticated | Role: admin

**Request Body:**
```json
{
  "hours": [
    { "day": 0, "open": "09:00", "close": "23:00", "isOpen": true },
    { "day": 1, "open": "09:00", "close": "23:00", "isOpen": true },
    { "day": 5, "open": null, "close": null, "isOpen": false }
  ]
}
```

---

## 5. Driver Module

### 5.1 Get Available Orders

**`GET /drivers/orders/available`**

**Access:** Authenticated | Role: driver

### 5.2 Accept Order

**`POST /drivers/orders/:orderId/accept`**

**Access:** Authenticated | Role: driver

### 5.3 Update Order Status

**`PATCH /drivers/orders/:orderId/status`**

**Access:** Authenticated | Role: driver

**Request Body:**
```json
{ "status": "PICKED_UP" }
```

Allowed transitions: `ASSIGNED → PICKED_UP → DELIVERED`

### 5.4 Update Location

**`PATCH /drivers/location`**

**Access:** Authenticated | Role: driver

**Request Body:**
```json
{
  "latitude": 24.7136,
  "longitude": 46.6753,
  "heading": 180
}
```

### 5.5 Get Earnings

**`GET /drivers/earnings?from=2025-01-01&to=2025-01-31`**

**Access:** Authenticated | Role: driver

---

## 6. Payments Module

### 6.1 Create Payment Intent

**`POST /payments/intent`**

**Access:** Authenticated

**Request Body:**
```json
{
  "orderId": "uuid",
  "method": "mada"
}
```

**Methods:** `mada`, `stcpay`, `tamara`, `tabby`

### 6.2 Confirm Payment

**`POST /payments/:paymentId/confirm`**

**Access:** Authenticated

**Request Body:**
```json
{ "transactionId": "gateway-transaction-id" }
```

### 6.3 Webhook (Gateway Callback)

**`POST /payments/webhook/:provider`**

**Access:** Public (IP whitelisted)

**Providers:** `mada`, `stcpay`, `tamara`, `tabby`

The webhook payload varies by provider. The API validates the signature and updates the order/payment status accordingly.

### 6.4 Get Payment History

**`GET /payments?page=1&limit=20`**

**Access:** Authenticated | Role: customer (own), admin (all)

---

## 7. Delivery Module

### 7.1 Calculate Delivery Fee

**`POST /delivery/estimate`**

**Access:** Authenticated

**Request Body:**
```json
{
  "vendorLat": 24.7136,
  "vendorLng": 46.6753,
  "customerLat": 24.7536,
  "customerLng": 46.6353
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distance": 5.2,
    "duration": 15,
    "fee": 15.00,
    "provider": "uber"
  }
}
```

### 7.2 Get Active Deliveries

**`GET /delivery/active`**

**Access:** Authenticated | Role: driver, admin

### 7.3 Get Delivery Status

**`GET /delivery/:orderId/status`**

**Access:** Authenticated | Role: customer, driver, admin

### 7.4 Request Manual Dispatch

**`POST /delivery/:orderId/manual-dispatch`**

**Access:** Authenticated | Role: admin

**Request Body:**
```json
{ "provider": "smsa", "notes": "Fragile items" }
```

---

## 8. Admin Module

### 8.1 Dashboard Stats

**`GET /admin/dashboard`**

**Access:** Authenticated | Role: admin

**Query Parameters:** `from`, `to`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1520,
    "totalRevenue": 189500.00,
    "activeDrivers": 45,
    "activeVendors": 120,
    "averageDeliveryTime": 28,
    "ordersByStatus": { "PENDING": 12, "CONFIRMED": 8, ... }
  }
}
```

### 8.2 List All Users

**`GET /admin/users?role=driver&page=1&limit=20`**

**Access:** Authenticated | Role: admin

### 8.3 Toggle Management

See [SMART_TOGGLES.md](./SMART_TOGGLES.md) for full toggle API documentation.

### 8.4 Get Audit Logs

**`GET /admin/audit-logs?page=1&limit=50`**

**Access:** Authenticated | Role: admin

### 8.5 Reports Export

**`GET /admin/reports/:type?from=...&to=...`**

**Access:** Authenticated | Role: admin

**Type:** `orders`, `revenue`, `drivers`, `vendors`, `zatca`

---

## 9. Notifications Module

### 9.1 Get Notifications

**`GET /notifications?page=1&limit=20`**

**Access:** Authenticated

### 9.2 Mark as Read

**`PATCH /notifications/:notificationId/read`**

**Access:** Authenticated

### 9.3 Mark All as Read

**`POST /notifications/read-all`**

**Access:** Authenticated

### 9.4 Register Push Token

**`POST /notifications/push-token`**

**Access:** Authenticated

**Request Body:**
```json
{ "token": "expo-push-token-or-fcm-token", "platform": "ios" }
```

---

## 10. Promotions Module

### 10.1 List Active Promotions

**`GET /promotions`**

**Access:** Authenticated

### 10.2 Validate Promo Code

**`POST /promotions/validate`**

**Access:** Authenticated

**Request Body:**
```json
{ "code": "WELCOME10", "orderTotal": 100.00 }
```

### 10.3 Create Promotion (Admin)

**`POST /promotions`**

**Access:** Authenticated | Role: admin

**Request Body:**
```json
{
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10,
  "maxUsage": 1000,
  "maxUsagePerUser": 1,
  "minOrder": 50.00,
  "maxDiscount": 30.00,
  "startsAt": "2025-01-01T00:00:00Z",
  "endsAt": "2025-01-31T23:59:59Z"
}
```

---

## 11. ZATCA (E-Invoicing)

### 11.1 Get Invoice

**`GET /zatca/invoices/:orderId`**

**Access:** Authenticated | Role: customer (own), admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoiceId": "MUF-2025-00001",
    "xml": "<?xml version='1.0'...",
    "qrCode": "base64-qr-image",
    "zatcaStatus": "SUBMITTED",
    "zatcaUUID": "uuid-from-zatca"
  }
}
```

### 11.2 Download Invoice PDF

**`GET /zatca/invoices/:orderId/pdf`**

**Access:** Authenticated | Role: customer (own), admin

**Response:** PDF binary (`Content-Type: application/pdf`)

### 11.3 Resubmit to ZATCA (Admin)

**`POST /zatca/invoices/:orderId/resubmit`**

**Access:** Authenticated | Role: admin

---

## 12. WebSocket Events

### Connection

```
ws://localhost:4000/socket.io/?token=<access_token>
```

Or via the Socket.IO client:

```javascript
import { io } from "socket.io-client";
const socket = io("https://api.mufasal.com", {
  auth: { token: "Bearer <access_token>" }
});
```

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `order:track` | `{ orderId }` | Subscribe to order updates |
| `order:untrack` | `{ orderId }` | Unsubscribe |
| `location:update` | `{ lat, lng, heading }` | Driver location update |
| `chat:send` | `{ orderId, message }` | Send a chat message |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `order:update` | `{ orderId, status, ... }` | Order status changed |
| `order:driver:location` | `{ orderId, lat, lng }` | Driver location |
| `notification` | `{ title, body, data }` | Push notification |
| `chat:message` | `{ orderId, from, message, timestamp }` | Chat message |
| `admin:order:new` | `{ order }` | New order (admin only) |

---

## Error Codes

| HTTP Code | Error Code | Description |
|-----------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body/params |
| 401 | `UNAUTHORIZED` | Missing or expired token |
| 401 | `TOKEN_EXPIRED` | Access token expired, use refresh |
| 403 | `FORBIDDEN` | Insufficient role permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource (e.g., duplicate phone) |
| 422 | `UNPROCESSABLE` | Business rule violation |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 502 | `PROVIDER_ERROR` | Third-party provider error |
| 503 | `MAINTENANCE` | System under maintenance |
