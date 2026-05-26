# MUFASAL — Smart Control Panel Toggle System

## Overview

The Smart Control Panel Toggle System allows operators and admins to enable or disable platform features in real-time without code deployments. All toggles are stored in PostgreSQL, cached in Redis, and evaluated at runtime by the API.

Toggles are organized into a dependency graph — disabling a parent toggle automatically cascades to disable all dependent child toggles.

---

## Toggle Categories & Master Toggles

### Category 1: Platform Status

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `platform:enabled` | boolean | `true` | Master kill switch — disables ALL platform operations |
| `platform:maintenance` | boolean | `false` | Maintenance mode — blocks new orders, shows maintenance page |
| `platform:new_registrations` | boolean | `true` | Allow new user registrations |
| `platform:guest_checkout` | boolean | `false` | Allow checkout without account |

### Category 2: Payments

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `payments:enabled` | boolean | `true` | Master payment toggle — disables ALL payment methods |
| `payments:mada` | boolean | `true` | Enable Mada (debit card) payments |
| `payments:stcpay` | boolean | `true` | Enable STC Pay (mobile wallet) |
| `payments:tamara` | boolean | `true` | Enable Tamara (BNPL — buy now pay later) |
| `payments:tabby` | boolean | `true` | Enable Tabby (BNPL) |
| `payments:cash_on_delivery` | boolean | `true` | Enable cash payment on delivery |
| `payments:minimum_amount` | number | `10.00` | Minimum order amount for payment |
| `payments:maximum_bnpl_amount` | number | `5000.00` | Maximum order amount for BNPL |

### Category 3: Delivery Providers

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `delivery:enabled` | boolean | `true` | Master delivery toggle — disables ALL deliveries |
| `delivery:uber` | boolean | `true` | Enable Uber Direct delivery |
| `delivery:careen` | boolean | `true` | Enable Careen delivery |
| `delivery:jeeny` | boolean | `true` | Enable Jeeny delivery |
| `delivery:smsa` | boolean | `true` | Enable SMSA Express shipping |
| `delivery:aramex` | boolean | `true` | Enable Aramex shipping |
| `delivery:ride_hailing_max_km` | number | `25` | Max distance (km) for ride-hailing providers |
| `delivery:free_delivery_threshold` | number | `100.00` | Order amount for free delivery |

### Category 4: Ordering

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `orders:enabled` | boolean | `true` | Master order toggle — disables ALL new orders |
| `orders:scheduling` | boolean | `true` | Allow customers to schedule future orders |
| `orders:immediate` | boolean | `true` | Allow immediate (asap) orders |
| `orders:max_items` | number | `50` | Maximum items per order |
| `orders:min_total` | number | `15.00` | Minimum order total |
| `orders:cancel_window_minutes` | number | `5` | Minutes after which order cannot be cancelled |

### Category 5: Ratings & Reviews

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `ratings:enabled` | boolean | `true` | Master rating toggle |
| `ratings:customer_reviews` | boolean | `true` | Allow customer reviews |
| `ratings:vendor_replies` | boolean | `true` | Allow vendor replies to reviews |
| `ratings:auto_publish` | boolean | `false` | Auto-publish reviews without moderation |
| `ratings:min_order_for_review` | number | `20.00` | Minimum order total to leave a review |

### Category 6: Promotions & Referrals

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `promotions:enabled` | boolean | `true` | Master promotion toggle |
| `promotions:referral_program` | boolean | `true` | Enable referral rewards |
| `promotions:coupons` | boolean | `true` | Enable coupon codes |
| `promotions:new_user_discount` | boolean | `true` | Enable first-order discount |
| `promotions:referral_reward_amount` | number | `25.00` | Reward amount per successful referral |

### Category 7: Geographic Restrictions

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `geo:enabled` | boolean | `true` | Master geographic toggle |
| `geo:cities:Riyadh` | boolean | `true` | Service enabled in Riyadh |
| `geo:cities:Jeddah` | boolean | `true` | Service enabled in Jeddah |
| `geo:cities:Dammam` | boolean | `true` | Service enabled in Dammam |
| `geo:cities:Mecca` | boolean | `true` | Service enabled in Mecca |
| `geo:cities:Medina` | boolean | `true` | Service enabled in Medina |
| `geo:max_service_radius_km` | number | `50` | Maximum delivery radius per city |

### Category 8: Notifications

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `notifications:enabled` | boolean | `true` | Master notification toggle |
| `notifications:push` | boolean | `true` | Enable push notifications |
| `notifications:sms` | boolean | `true` | Enable SMS notifications |
| `notifications:email` | boolean | `true` | Enable email notifications |
| `notifications:order_updates` | boolean | `true` | Notify on order status changes |
| `notifications:promotional` | boolean | `true` | Send promotional notifications |

### Category 9: ZATCA (E-Invoicing)

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `zatca:enabled` | boolean | `true` | Master ZATCA toggle |
| `zatca:simulation_mode` | boolean | `true` | Simulate ZATCA without actual submission |
| `zatca:auto_submit` | boolean | `true` | Auto-submit invoices to ZATCA |
| `zatca:daily_summary` | boolean | `true` | Send daily compliance summary |

### Category 10: Admin

| Toggle Key | Type | Default | Description |
|-----------|------|---------|-------------|
| `admin:manual_dispatch` | boolean | `true` | Allow admin to manually assign deliveries |
| `admin:override_pricing` | boolean | `false` | Allow admin to override delivery/pricing |
| `admin:audit_logging` | boolean | `true` | Enable audit logging |
| `admin:debug_mode` | boolean | `false` | Enable debug information in responses |

---

## Toggle Dependency Graph

Disabling a parent toggle automatically cascades to disable all children. The system does **not** automatically re-enable children when the parent is re-enabled (they remain in the state they were in before the parent was disabled).

```
platform:enabled
├── payments:enabled
│   ├── payments:mada
│   ├── payments:stcpay
│   ├── payments:tamara
│   ├── payments:tabby
│   └── payments:cash_on_delivery
├── delivery:enabled
│   ├── delivery:uber
│   ├── delivery:careen
│   ├── delivery:jeeny
│   ├── delivery:smsa
│   └── delivery:aramex
├── orders:enabled
│   ├── orders:scheduling
│   └── orders:immediate
├── promotions:enabled
│   ├── promotions:referral_program
│   ├── promotions:coupons
│   └── promotions:new_user_discount
├── ratings:enabled
│   ├── ratings:customer_reviews
│   ├── ratings:vendor_replies
│   └── ratings:auto_publish
├── notifications:enabled
│   ├── notifications:push
│   ├── notifications:sms
│   └── notifications:email
├── geo:enabled
│   └── (all city toggles)
└── zatca:enabled
    ├── zatca:simulation_mode
    ├── zatca:auto_submit
    └── zatca:daily_summary

payments:enabled
└── payments:tamara, payments:tabby (BNPL restricted further by max amount)

delivery:enabled
├── delivery:uber
├── delivery:careen
├── delivery:jeeny
├── delivery:smsa
└── delivery:aramex

promotions:enabled
├── promotions:coupons
└── promotions:referral_program
    └── promotions:new_user_discount
```

### Cascading Disable Algorithm

```
                          ┌──────────────┐
                          │ Toggle Off   │
                          │ "payments:   │
                          │  enabled"    │
                          └──────┬───────┘
                                 │
                                 ▼
              ┌──────────────────────────────────┐
              │ Look up all direct children in   │
              │ the dependency graph              │
              └────────────────┬─────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────┐
              │ For each child:                   │
              │  • Record current state           │
              │  • Disable child                  │
              │  • Recursively disable            │
              │    grandchildren                  │
              │  • Store in revert_set            │
              └────────────────┬─────────────────┘
                               │
                               ▼
              ┌──────────────────────────────────┐
              │ When parent is re-enabled:        │
              │  • NOTICE: children are NOT       │
              │    auto-re-enabled                │
              │  • Admin must manually review     │
              │    and re-enable each child       │
              └──────────────────────────────────┘
```

---

## Configuration API

### Get All Toggles

**`GET /admin/toggles`**

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "toggles": [
      {
        "key": "payments:mada",
        "value": true,
        "type": "boolean",
        "category": "payments",
        "description": "Enable Mada payments",
        "dependencies": ["payments:enabled"],
        "updatedAt": "2025-01-15T10:30:00Z",
        "updatedBy": "admin@mufasal.com"
      }
    ]
  }
}
```

### Get Toggle

**`GET /admin/toggles/:key`**

**Access:** Admin only

**Example:** `GET /admin/toggles/payments:tamara`

### Update Toggle

**`PATCH /admin/toggles/:key`**

**Access:** Admin only

**Request Body:**
```json
{
  "value": false,
  "reason": "Temporarily disabling Tamara due to gateway maintenance"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "key": "payments:tamara",
    "previousValue": true,
    "newValue": false,
    "cascaded": ["payments:tamara"],
    "reason": "Temporarily disabling Tamara due to gateway maintenance",
    "timestamp": "2025-01-15T11:00:00Z"
  }
}
```

When a parent is disabled, `cascaded` lists all child toggles that were also disabled.

### Bulk Update Toggles

**`POST /admin/toggles/bulk`**

**Access:** Admin only

**Request Body:**
```json
{
  "toggles": [
    { "key": "delivery:uber", "value": false, "reason": "Uber API outage" },
    { "key": "delivery:careen", "value": true }
  ]
}
```

### Get Toggle History

**`GET /admin/toggles/:key/history`**

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "previousValue": true,
      "newValue": false,
      "reason": "Gateway maintenance",
      "updatedBy": "admin@mufasal.com",
      "timestamp": "2025-01-15T11:00:00Z"
    }
  ]
}
```

---

## Configuration Guide

### Redis Cache

Toggles are cached in Redis for fast runtime evaluation (TTL: 60 seconds).

```typescript
// Example: checking a toggle in the API
const isMadaEnabled = await toggleService.isEnabled("payments:mada");
```

### Database Schema

```prisma
model Toggle {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   // "true" / "false" / numeric string
  type        String   // "boolean" | "number"
  category    String
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
}

model ToggleHistory {
  id            String   @id @default(uuid())
  toggleKey     String
  previousValue String
  newValue      String
  reason        String?
  updatedBy     String?
  timestamp     DateTime @default(now())
}
```

### Auditing

Every toggle change is logged in `ToggleHistory` with:
- Previous and new values
- Admin email who made the change
- Reason for the change
- Timestamp
- Affected cascaded toggles

---

## Example Scenarios

### Scenario A: Payment Gateway Outage

**Problem:** STC Pay is experiencing an outage.

**Action:** Admin sets `payments:stcpay` → `false`.

**Result:**
- STC Pay option is hidden from all checkout pages
- Existing STC Pay transactions in-flight continue normally
- No cascading effect (leaf toggle)

**Revert:** Admin sets `payments:stcpay` → `true` after STC Pay confirms resolution.

### Scenario B: Nationwide Delivery Pause

**Problem:** Severe weather conditions across the kingdom.

**Action:** Admin sets `delivery:enabled` → `false`.

**Cascading:**
- `delivery:uber` → `false`
- `delivery:careen` → `false`
- `delivery:jeeny` → `false`
- `delivery:smsa` → `false`
- `delivery:aramex` → `false`

**Result:**
- No new orders can be placed (order flow checks delivery availability)
- In-progress deliveries continue normally
- Customer-facing message: "Delivery is temporarily unavailable in your area"

**Revert:** Admin sets `delivery:enabled` → `true`. Child toggles remain `false` — admin must re-enable each wanted provider.

### Scenario C: City-Specific Restriction

**Problem:** A new regulation requires temporarily pausing operations in Mecca.

**Action:** Admin sets `geo:cities:Mecca` → `false`.

**Result:**
- API rejects order creation for addresses in Mecca (checked at address validation)
- Vendor listings in Mecca are hidden from customers
- Active deliveries in Mecca continue to completion
- Customers in Mecca see "Currently not available in your area"

**Revert:** Admin sets `geo:cities:Mecca` → `true`.

### Scenario D: ZATCA Testing

**Problem:** Need to test invoice generation without submitting to ZATCA.

**Action:** Admin sets `zatca:simulation_mode` → `true`.

**Result:**
- Invoices are generated and stored locally
- ZATCA API is NOT called
- QR codes are generated normally
- Invoice records are marked as "SIMULATED"

**Revert:** Admin sets `zatca:simulation_mode` → `false`.

### Scenario E: Complete Platform Shutdown

**Problem:** Emergency maintenance.

**Action:** Admin sets `platform:enabled` → `false`.

**Cascading:** Every toggle in every category is disabled.

**Result:**
- All API endpoints return 503 with maintenance message
- Mobile/web apps show maintenance screen
- Active orders continue with reduced functionality
- No new logins (except admin)
- Background jobs pause

**Revert:** Admin sets `platform:enabled` → `true`. Every sub-toggle must be manually re-enabled.
