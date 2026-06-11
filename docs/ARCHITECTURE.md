# MUFASAL — System Architecture

## 1. System Overview

MUFASAL is a multi-platform delivery and logistics platform serving Saudi Arabia. It connects customers, drivers, and vendors across web, mobile, and API channels.

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Next.js  │  │  React   │  │  Expo    │  │ 3rd-Party│   │
│  │  Web App  │  │  Native  │  │  Mobile  │  │  APIs    │   │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘  └─────┬────┘   │
└────────┼───────────────┼────────────┼──────────────┼────────┘
         │               │            │              │
    ┌────▼───────────────▼────────────▼──────────────▼────┐
    │                 Nginx Reverse Proxy                  │
    │          SSL · Rate Limiting · Caching               │
    └─────────────────────┬───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
    ┌─────────▼─────────┐   ┌────────▼──────────┐
    │  Express API       │   │  Next.js SSR      │
    │  :4000             │   │  :3000            │
    │  REST + Socket.IO  │   │  Server-Side      │
    │  Prisma ORM        │   │  Rendering        │
    └─────────┬──────────┘   └───────────────────┘
              │
    ┌─────────┴──────────────┐
    │                        │
┌───▼────┐           ┌──────▼─────┐
│Postgres│           │   Redis    │
│  :5432 │           │   :6379    │
└────────┘           └────────────┘
```

## 2. Tech Stack Decisions

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **Mobile** | React Native (Expo) | Single codebase for iOS & Android; OTA updates via EAS; large ecosystem |
| **Web** | Next.js 14 (App Router) | SSR for SEO, React Server Components for performance, API routes for BFF |
| **API** | Express.js + TypeScript | Mature, flexible, vast middleware ecosystem |
| **ORM** | Prisma | Type-safe queries, auto-generated types, migrations, great DX |
| **Database** | PostgreSQL 16 | ACID compliance, JSONB for flexible fields, PostGIS for geolocation |
| **Cache & Queue** | Redis 7 | Session store, rate limiting, pub/sub for real-time events, Bull job queues |
| **Validation** | Zod | Runtime type validation, inferred TypeScript types |
| **Auth** | JWT + Firebase Auth | Stateless tokens for API, Firebase for social login |
| **Payments** | Mada / STC Pay / Tamara / Tabby | Local payment gateways required for Saudi market |
| **Tax** | ZATCA Fatoora API | Mandatory e-invoicing compliance in Saudi Arabia |
| **Delivery** | Uber API / Careen / Jeeny | Multi-provider dispatch for last-mile delivery |
| **Containerization** | Docker + Docker Compose | Consistent dev/prod parity, easy deployment |
| **Reverse Proxy** | Nginx | SSL termination, caching, rate limiting, WebSocket proxy |

## 3. Folder Structure

```
mufasal/
├── apps/
│   ├── web/                    # Next.js 14 web application
│   │   ├── app/                # App Router pages & layouts
│   │   ├── components/         # Shared UI components
│   │   ├── lib/                # Utilities, API client, hooks
│   │   ├── public/             # Static assets
│   │   └── next.config.js
│   │
│   └── mobile/                 # Expo / React Native app
│       ├── app/                # Expo Router screens
│       ├── components/         # Reusable RN components
│       ├── lib/                # API client, auth, helpers
│       └── app.json
│
├── services/
│   └── api/                    # Express.js backend
│       ├── prisma/             # Schema, migrations, seed
│       ├── src/
│       │   ├── modules/        # Feature modules (auth, orders, etc.)
│       │   ├── common/         # Shared middleware, guards, DTOs
│       │   ├── config/         # Environment config
│       │   └── index.ts        # Entry point
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared types, validators, constants
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   ├── validators/     # Zod schemas
│   │   │   └── constants/      # Enums, config
│   │   └── package.json
│   │
│   └── ui/                     # Shared UI components (web + mobile)
│       ├── src/
│       │   ├── components/     # Universal components
│       │   └── index.ts
│       └── package.json
│
├── docker/                     # Docker configs
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── Dockerfile.mobile
│   └── nginx.conf
│
├── scripts/                    # Setup & deployment scripts
│   ├── setup.ps1
│   ├── setup.sh
│   └── deploy.sh
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   └── SMART_TOGGLES.md
│
├── docker-compose.yml
├── .env.example
└── package.json               # Root workspace config
```

## 4. Data Flow Diagrams

### 4.1 Authentication Flow

```
User                    Frontend                  API                  Firebase/Database
 │                        │                       │                       │
 │  Login(Email/Phone)    │                       │                       │
 ├───────────────────────►│                       │                       │
 │                        │  POST /auth/login     │                       │
 │                        ├──────────────────────►│                       │
 │                        │                       │  Verify credentials   │
 │                        │                       ├──────────────────────►│
 │                        │                       │◄──────────────────────┤
 │                        │                       │                       │
 │                        │  { accessToken,        │                       │
 │                        │    refreshToken }      │                       │
 │                        │◄──────────────────────┤                       │
 │◄───────────────────────┤                       │                       │
 │                        │                       │                       │
 │  Store tokens          │                       │                       │
 │  (httpOnly cookie      │                       │                       │
 │   or secure storage)   │                       │                       │
 │                        │                       │                       │
 │  Every API call        │                       │                       │
 │  includes:             │                       │                       │
 │  Authorization:        │                       │                       │
 │  Bearer <accessToken>  │                       │                       │
 │                        │                       │                       │
```

### 4.2 Order Lifecycle

```
  PENDING ──► CONFIRMED ──► PREPARING ──► READY ──► ASSIGNED ──► PICKED_UP
    │            │              │             │          │             │
    │            │              │             │          │             │
    ▼            ▼              ▼             ▼          ▼             ▼
 CANCELLED   (payment      (kitchen      (awaiting   (driver       (en route)
             confirmed)     started)      driver)     assigned)
                                                                    │
                                                                    ▼
                                                              DELIVERED
                                                                    │
                                                                    ▼
                                                              COMPLETED
                                                                    │
                                                                    ▼
                                                              RATED
```

### 4.3 Payment Flow

```
Customer                  Frontend                API              Payment Gateway
   │                        │                     │                     │
   │  Select payment        │                     │                     │
   │  method & confirm      │                     │                     │
   ├───────────────────────►│                     │                     │
   │                        │  POST /orders       │                     │
   │                        ├────────────────────►│                     │
   │                        │                     │                     │
   │                        │  For Mada/STCPay:   │                     │
   │                        │  POST /payments/    │                     │
   │                        │  intent             │                     │
   │                        ├────────────────────►│                     │
   │                        │                     │ Create payment      │
   │                        │                     │ intent              │
   │                        │                     ├────────────────────►│
   │                        │                     │◄────────────────────┤
   │                        │  { paymentUrl,      │                     │
   │                        │    transactionId }   │                     │
   │                        │◄────────────────────┤                     │
   │  Redirect to           │                     │                     │
   │  payment page          │                     │                     │
   ├───────────────────────►│                     │                     │
   │                        │  Redirect           │                     │
   │◄───────────────────────┤                     │                     │
   │                        │                     │                     │
   │  (User completes payment on gateway page)     │                     │
   │                        │                     │                     │
   │                        │  Webhook:           │                     │
   │                        │  payment.update     │                     │
   │                        │◄────────────────────┤                     │
   │                        │                     │                     │
   │  For BNPL (Tamara/     │                     │                     │
   │  Tabby): redirect      │                     │                     │
   │  to installment plan   │                     │                     │
   │                        │                     │                     │
```

### 4.4 Delivery Dispatch Logic

```
  Order READY for dispatch
           │
           ▼
  ┌──────────────────┐
  │ Determine         │ ◄── Smart Toggles: delivery_provider,
  │ provider pool     │      uber_enabled, careen_enabled,
  └────────┬─────────┘      jeeny_enabled, smsa_enabled,
           │                aramex_enabled
           ▼
  ┌──────────────────┐
  │ Check distance/   │ ◄── If < 25km → ride-hailing (Uber/Careen/Jeeny)
  │ delivery type     │      If ≥ 25km → shipping (SMSA/Aramex)
  └────────┬─────────┘      If bulk → shipping only
           │
           ▼
  ┌──────────────────┐
  │ Dispatch to       │
  │ primary provider  │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ Provider accepts? │ ─── No ──► Fallback to next provider
  │ (timeout: 30s)    │                  │
  └────────┬─────────┘                  ▼
           │ Yes               ┌──────────────────┐
           ▼                   │ All providers     │
  ┌──────────────────┐         │ exhausted?        │
  │ Assign driver,    │         └────────┬─────────┘
  │ notify customer   │           Yes    │         No
  └──────────────────┘                  ▼         └──► Try next
                                 ┌──────────────────┐     provider
                                 │ Notify admin:     │
                                 │ manual dispatch   │
                                 │ required          │
                                 └──────────────────┘
```

## 5. Smart Toggle System

The Smart Control Panel Toggle System allows operators to enable/disable features in real-time without deployments. See [SMART_TOGGLES.md](./SMART_TOGGLES.md) for full details.

Key categories:
- **Payment toggles** — enable/disable Mada, STC Pay, Tamara, Tabby
- **Delivery toggles** — enable/disable Uber, Careen, Jeeny, SMSA, Aramex
- **Feature toggles** — enable/disable ratings, referrals, promos, scheduling
- **Geographic toggles** — enable/disable service in specific cities/regions

## 6. ZATCA Compliance

Saudi Arabia's ZATCA (Zakat, Tax and Customs Authority) mandates e-invoicing (Fatoora). MUFASAL handles this as follows:

1. **Invoice Generation** — Every completed order generates a ZATCA-compliant XML invoice (UBL 2.1 format)
2. **Cryptographic Stamping** — Each invoice is signed with the seller's private key and includes a QR code
3. **Submission** — Invoices are submitted to ZATCA's API (CSID + PIH)
4. **Reporting** — Periodic compliance reports, daily summary submissions
5. **QR Code** — Each invoice PDF/HTML includes a ZATCA QR code with: seller name, VAT number, timestamp, total, VAT total

## 7. WebSockets (Socket.IO)

Real-time communication uses Socket.IO with Redis adapter for horizontal scaling:

- **Order status updates** — pushed to customer and admin panels
- **Driver location tracking** — real-time GPS coordinates pushed to customer
- **Notifications** — chat messages, system alerts
- **Admin dashboards** — live order board, metrics

```
Client         Nginx          API Server (xN)       Redis (Pub/Sub)
  │              │                 │                    │
  │──connect────►│──upgrade───────►│                    │
  │              │                 │──subscribe────────►│
  │              │                 │◄───message─────────│
  │◄─event───────┤◄────────────────│                    │
```
