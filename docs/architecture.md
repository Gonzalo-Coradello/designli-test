# Architecture & Design Decisions

## Overview

A full-stack real-time stock tracking application consisting of:

- **`api/`** — NestJS REST + WebSocket backend
- **`app/`** — React Native (Expo) mobile application

Both projects are independent (separate `package.json`, separate repos), connected only through the HTTP/WebSocket API contract.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App (Expo)                 │
│                                                             │
│  Expo Router (file-based)   TanStack Query   Zustand        │
│  app/(auth)/login.tsx   ──► src/features/auth/              │
│  app/(tabs)/index.tsx   ──► src/features/stocks/            │
│  app/(tabs)/alerts.tsx  ──► src/features/alerts/            │
│                                                             │
│            Axios (REST)       Socket.IO client (WS)         │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
         HTTP/HTTPS                    WebSocket
                │                           │
┌───────────────▼───────────────────────────▼─────────────────┐
│                         NestJS API                          │
│                                                             │
│  AuthModule   StocksModule   AlertsModule   Notifications   │
│                    │               │              │         │
│              RealtimeModule ◄──────┘         Firebase SDK   │
│            StockEventsService                               │
│            (EventEmitter2)                                  │
│                    │                                        │
│              TypeORM (PostgreSQL)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   PostgreSQL   Finnhub API   Firebase FCM
```

---

## 2. Project Structure

### API (`api/`)

Standard NestJS module layout. Each feature module owns its controller, service, DTOs, and entities.

```
api/src/
├── auth/
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/
│   ├── entities/
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
├── stocks/
│   ├── dto/
│   ├── stocks.controller.ts
│   ├── stocks.service.ts
│   ├── finnhub.service.ts
│   └── stocks.module.ts
├── alerts/
│   ├── dto/
│   ├── entities/
│   ├── alerts.controller.ts
│   ├── alerts.service.ts
│   ├── alerts.repository.ts
│   ├── alert-checker.service.ts   ← event-driven, reacts to price events
│   └── alerts.module.ts
├── notifications/
│   ├── firebase.service.ts
│   ├── notifications.service.ts
│   └── notifications.module.ts
├── realtime/
│   ├── stock.gateway.ts
│   ├── stock-events.service.ts
│   └── realtime.module.ts
├── database/
│   ├── database.module.ts
│   └── database.config.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── guards/
│   ├── constants/
│   └── utils/
├── config/
│   ├── env.validation.ts
│   └── configuration.ts
├── app.module.ts
└── main.ts
```

### Mobile App (`app/`)

Feature-based structure inside `src/`. Expo Router owns the `app/` route directory; route files are thin wrappers that import from `src/features/`.

```
app/
├── app/                        ← Expo Router routes (file-based routing)
│   ├── _layout.tsx
│   ├── (auth)/
│   │   └── login.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx            ← Dashboard
│       └── alerts.tsx
└── src/
    ├── features/
    │   ├── auth/
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── screens/
    │   │   ├── components/
    │   │   ├── auth.store.ts
    │   │   └── types.ts
    │   ├── stocks/
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── screens/
    │   │   ├── components/
    │   │   ├── stocks.store.ts
    │   │   └── types.ts
    │   └── alerts/
    │       ├── api/
    │       ├── hooks/
    │       ├── screens/
    │       ├── components/
    │       └── types.ts
    ├── notifications/
    │   └── notification.service.ts
    ├── realtime/
    │   ├── socket.service.ts
    │   └── hooks/
    ├── navigation/
    │   └── types.ts                 ← typed Expo Router Href helpers (no navigator file needed)
    ├── shared/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   ├── theme/
    │   ├── constants/
    │   │   └── stocks.ts            ← hardcoded list of tracked symbols (AAPL, MSFT, GOOGL …)
    │   └── utils/
    ├── api/
    │   ├── axios.ts
    │   └── interceptors.ts
    └── store/
        └── index.ts
```

---

## 3. Data Access Layer (Repository Pattern)

Each feature module that persists data to PostgreSQL follows a strict layering convention: **controllers** handle transport, **services** own business logic, and **repositories** own all database access.

```
Controller  →  Service  →  Repository  →  TypeORM  →  PostgreSQL
                  ↓
           External clients (Finnhub, Firebase) — NOT repositories
```

### Responsibility split

| Layer | Owns | Must NOT own |
|---|---|---|
| **Controller** | HTTP/WS transport, DTO validation, guards | Business rules, DB queries |
| **Service** | Business logic, orchestration, domain exceptions | TypeORM `Repository`, raw SQL, `findOne`/`save` calls |
| **Repository** | CRUD and query methods for one entity | Business rules, HTTP exceptions |
| **Entity** | DB column mapping | Behavior beyond simple helpers |

### File layout (modules with persistence)

Controller, service, and repository live as **flat files** in the module folder. Use subfolders only for `entities/` and `dto/`:

```
feature/
├── entities/
├── dto/
├── feature.controller.ts
├── feature.service.ts
├── feature.repository.ts
└── feature.module.ts
```

### Dependency injection

Services inject the concrete repository class directly — no interface file or injection token:

```ts
// users.service.ts
constructor(private readonly usersRepository: UsersRepository) {}

// users.module.ts
providers: [UsersRepository, UsersService],
```

Repository interfaces are optional and not used in this project. Concrete repositories are sufficient for separation of concerns and testability (mock `UsersRepository` via NestJS `useValue` in tests).

### Rules

- **`@InjectRepository` only inside `*.repository.ts` files** — never in services.
- **Repository** returns `null` when a row is not found; throws only on infrastructure failures.
- **Service** translates `null` into domain exceptions (`NotFoundException`, `ConflictException`).
- **Repository** methods are named after data operations (`findByEmail`, `create`) — not business intents (`registerUser`).

### What does NOT get a repository

Repositories are for **PostgreSQL persistence only**. These remain infrastructure adapters:

- `FinnhubService` — Finnhub REST API
- `FinnhubWsClient` — Finnhub WebSocket
- `FirebaseService` / `NotificationsService` — FCM
- `StockEventsService` — in-process event bus

---

## 4. Stock List & "Graphic of all Stocks"

### Stock list ownership

The "List of stocks" (Requirement 3) is driven by a **hardcoded watchlist** defined in `src/shared/constants/stocks.ts`. This keeps the scope realistic and avoids the need for a separate watchlist CRUD feature. Users browse this fixed set of symbols (e.g. AAPL, MSFT, GOOGL, TSLA, AMZN, META, NVDA) and create price alerts against any of them.

### Graphic interpretation

Requirement 4 ("Graphic of all Stocks") is implemented as **two complementary views**:

1. **Sparkline per list item** — each row in the stock list renders a small inline line chart (`StockSparkline` component) showing the last 7 days of hourly price data. This visually satisfies "graphic of all stocks" at a glance.
2. **Full chart on detail screen** — tapping a stock opens a dedicated screen with a larger candlestick/line chart and configurable time range.

Both views are powered by `GET /stocks/:symbol/candles`. The Finnhub free tier supports intraday data (1-min, 5-min, 60-min resolution) for approximately the last 30 days, which is sufficient for both use cases.

---

## 5. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend framework | NestJS + TypeScript | Module system maps cleanly to feature boundaries; built-in DI |
| ORM | TypeORM | First-class NestJS integration; migration tooling |
| Database | PostgreSQL | Reliable, ACID-compliant, good support for the data model |
| Auth | `@nestjs/jwt` + `passport-jwt` | Standard NestJS pattern; stateless JWT |
| WebSockets (server) | `@nestjs/websockets` + Socket.IO | Room support for per-symbol broadcasting |
| Finnhub WS client | `ws` (Node.js) | Lightweight, used only server-side |
| Push notifications | `firebase-admin` | Official server SDK for FCM |
| Mobile framework | React Native + Expo (managed) | Faster setup; EAS Build for Android |
| Mobile routing | Expo Router v3 | File-based routing, modern Expo standard |
| Server state | TanStack Query v5 | Cache, background refetch, mutation lifecycle |
| Client state | Zustand | Minimal boilerplate; per-feature stores |
| HTTP client | Axios | Interceptor support for token refresh |
| Forms | react-hook-form + zod | Typesafe, performant, minimal re-renders |
| Charts | react-native-gifted-charts | Supports line/candlestick; Expo-compatible |
| Mobile FCM | `@react-native-firebase/messaging` | Official React Native Firebase SDK |
| Containerization | Docker + docker-compose | Required extra point; added in final phase |

**File naming:** kebab-case throughout both projects (e.g. `auth.service.ts`, `stock-list-item.tsx`).

---

## 6. Database Schema

```sql
-- users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,     -- bcrypt hash
  fcm_token   VARCHAR(512),              -- updated on each app launch
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
);

-- stock_alerts
CREATE TABLE stock_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol        VARCHAR(20) NOT NULL,
  target_price  DECIMAL(12, 4) NOT NULL,
  is_triggered  BOOLEAN DEFAULT false,
  triggered_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT now(),
  updated_at    TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_stock_alerts_user_id ON stock_alerts(user_id);
CREATE INDEX idx_stock_alerts_symbol  ON stock_alerts(symbol) WHERE NOT is_triggered;
```

Entities extend a shared `BaseEntity` with `id`, `createdAt`, `updatedAt`. Schema changes are managed via TypeORM migrations.

---

## 7. Authentication Flow

```
Mobile                                  NestJS
  │                                        │
  ├─ POST /auth/register ─────────────────►│ hash password (bcrypt)
  │◄──── { accessToken, refreshToken } ────┤ sign JWT access (15 min)
  │                                        │ sign JWT refresh (7 days)
  │                                        │
  ├─ POST /auth/login ────────────────────►│
  │◄──── { accessToken, refreshToken } ────┤
  │                                        │
  │  store both tokens in expo-secure-store│
  │                                        │
  ├─ API requests ────────────────────────►│ JwtAuthGuard validates
  │  Authorization: Bearer <accessToken>   │
  │                                        │
  │  [401 received] ──────────────────────►│
  ├─ POST /auth/refresh ──────────────────►│ verify refreshToken
  │◄──── { accessToken, refreshToken } ────┤ rotate both tokens
  │  retry original request                │
  │                                        │
  ├─ PATCH /users/me/fcm-token ───────────►│ store FCM token on user row
```

**Mobile token management:**
- Axios request interceptor injects `Authorization` header
- Axios response interceptor handles 401 → auto-refresh → retry
- `auth.store.ts` (Zustand) holds the in-memory session; `expo-secure-store` persists tokens across cold starts

**Refresh token strategy:** Tokens are **purely stateless** (signed JWTs, no DB table). On refresh, the old pair is discarded and a new pair is issued. Trade-off: tokens cannot be revoked before expiry. This is an acceptable constraint for this scope; a production system would add a `refresh_tokens` table with rotation tracking.

---

## 8. Real-Time Stock Updates

### Server-side flow

```
FinnhubWsClient ──► StockEventsService.emit('price.update', { symbol, price })
                                │
                    ┌───────────┴────────────┐
                    │                        │
             StockGateway              AlertCheckerService
        broadcast to Socket.IO        query untriggered alerts
        room for that symbol          for this symbol + price
             ▼                               ▼
       Mobile clients              NotificationsService.send()
```

- `FinnhubWsClient` connects to `wss://ws.finnhub.io` on module init
- Tracks which symbols have active alert subscriptions to avoid redundant Finnhub subscriptions (ref-counted Set)
- `StockEventsService` uses NestJS `EventEmitter2` as an internal event bus
- `StockGateway` also manages client subscriptions: clients join/leave Socket.IO rooms named by symbol (e.g. `room:AAPL`)

### Client-side flow

```
useStockSocket(symbols) hook
  │
  ├─ connects once on mount (auth token in handshake)
  ├─ emits 'subscribe' with symbol list
  └─ on 'price.update' → updates stocks.store (Zustand)
                           ↓
                  DashboardScreen re-renders live prices
```

- TanStack Query handles all REST calls (historical candles, alerts CRUD, initial quote fetch)
- Zustand `stocks.store.ts` holds `{ [symbol]: { price, timestamp } }` for live prices only
- The two layers do not overlap

---

## 9. Firebase Push Notification Flow

```
AlertCheckerService
  │
  ├─ receives 'price.update' event
  ├─ queries: SELECT * FROM stock_alerts
  │            WHERE symbol = $1
  │              AND target_price <= $2
  │              AND is_triggered = false
  │
  └─ for each matched alert:
       ├─ UPDATE stock_alerts SET is_triggered = true, triggered_at = now()
       ├─ fetch user.fcm_token
       └─ NotificationsService.sendPriceAlert(fcmToken, symbol, price)
                │
                └─ firebase-admin messaging.send({ token, title, body })
                                │
                          Firebase FCM ──► Device
```

**Mobile FCM setup:**
- On app start: `messaging().requestPermission()` → `getToken()` → `PATCH /users/me/fcm-token`
- `setBackgroundMessageHandler` displays native notification when app is in background/killed
- Foreground messages handled via `onMessage` listener

---

## 10. SOLID Principles Applied

| Principle | Where applied |
|---|---|
| **Single Responsibility** | Services own business logic; repositories own DB access; `FinnhubService` (external API), `StockEventsService` (internal bus), `AlertCheckerService` (alert logic), `NotificationsService` (FCM) each own one concern |
| **Open/Closed** | New alert condition types can be added without modifying existing checker logic |
| **Liskov Substitution** | Repositories are swappable in tests via NestJS `useValue` mocks without requiring a formal interface |
| **Interface Segregation** | Each repository exposes only methods for its entity; modules do not cross-import storage logic |
| **Dependency Inversion** | Services depend on repository classes (`UsersRepository`), not on TypeORM `Repository<T>` directly |

---

## 11. Known Constraints

| Constraint | Detail |
|---|---|
| **Finnhub free tier** | Intraday candles (1-min, 5-min, 60-min) available for ~30 days lookback. Daily candles available for ~1 year. Chart time ranges are limited accordingly. WebSocket real-time trade data is available for US stocks. |
| **Refresh token revocation** | Stateless JWT — tokens cannot be invalidated before expiry. Acceptable for this scope. |
| **Alert triggering** | Alerts are checked server-side on every incoming price tick. Finnhub WebSocket sends trade data in batches; frequency depends on market activity. During market hours, popular symbols update several times per second. |
| **FCM in Expo managed workflow** | `@react-native-firebase/messaging` requires the bare workflow or Expo's `expo-build-properties` plugin. Firebase configuration files (`google-services.json` for Android, `GoogleService-Info.plist` for iOS) must be added to the project before building. |

---

## 12. Environment Variables

### API (`.env`)

```
# App
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=stocktracker
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Finnhub
FINNHUB_API_KEY=your-finnhub-key
FINNHUB_WS_URL=wss://ws.finnhub.io

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### App (`.env`)

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=http://localhost:3000
```
