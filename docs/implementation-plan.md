# Implementation Plan

---

## Phase 1 — Project Setup & Auth

**Goal:** Running backend with JWT auth, mobile login screen that authenticates against it.

### API
- [ ] Install and configure dependencies: TypeORM, PostgreSQL driver, `@nestjs/config`, `@nestjs/jwt`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`
- [ ] `config/` — `configuration.ts` (typed config factory) + `env.validation.ts` (Joi or zod schema)
- [ ] `database/` — TypeORM module wired to config, `synchronize: false` (use migrations)
- [ ] `common/` — `BaseEntity` (id, createdAt, updatedAt), global `HttpExceptionFilter`, global `ValidationPipe` with `transform: true, whitelist: true`
- [ ] `users/` — `User` entity, `UsersService` (findByEmail, findById, updateFcmToken), `UsersController` with `PATCH /users/me/fcm-token` endpoint (protected by `JwtAuthGuard`)
- [ ] `auth/` — `register`, `login`, `refresh` endpoints; `JwtStrategy`, `JwtAuthGuard`; bcrypt password hashing
- [ ] First TypeORM migration: `create_users_table`
- [ ] Swagger setup in `main.ts`

### App
- [ ] Install dependencies: Axios, TanStack Query, Zustand, react-hook-form, zod, expo-secure-store, `@react-native-firebase/app`, `@react-native-firebase/messaging`
- [ ] `src/api/axios.ts` — Axios instance with base URL from env
- [ ] `src/api/interceptors.ts` — request interceptor (inject token), response interceptor (401 → refresh → retry)
- [ ] `src/features/auth/auth.store.ts` — Zustand store (user, tokens, setSession, clearSession)
- [ ] `src/features/auth/api/` — `auth.api.ts` (login, register, refresh)
- [ ] `src/features/auth/hooks/use-auth.ts` — TanStack Query mutations for login/register
- [ ] `src/features/auth/screens/login-screen.tsx` — email/password form (react-hook-form + zod)
- [ ] `app/(auth)/login.tsx` — route wrapper
- [ ] `app/_layout.tsx` — root layout with `QueryClientProvider`, auth redirect logic

**Checkpoint:** Can register, log in, receive JWT, and persist session. API and mobile talk to each other.

---

## Phase 2 — Stocks (REST + Real-Time WebSocket)

**Goal:** Live stock price list on the dashboard; prices update in real time via WebSocket.

### API
- [ ] Install additional dependencies: `@nestjs/event-emitter`, `ws`, `@types/ws`
- [ ] `stocks/` — `FinnhubService` (HTTP: quote, symbol search, candles via Finnhub REST API)
- [ ] `stocks/` — `StocksController` with endpoints:
  - `GET /stocks/search?q=` — symbol search
  - `GET /stocks/:symbol/quote` — current quote (light cache: 5s)
  - `GET /stocks/:symbol/candles?resolution=60&days=7` — OHLCV history for sparklines and full chart
- [ ] `realtime/` — `StockEventsService` (NestJS `EventEmitter2` wrapper; register `EventEmitterModule` in `AppModule`)
- [ ] `realtime/` — `FinnhubWsClient` — connects to `wss://ws.finnhub.io` on module init; manages symbol subscriptions (ref-counted Set to avoid duplicate Finnhub subs); emits `price.update` events via `StockEventsService`
- [ ] `realtime/` — `StockGateway` (`@WebSocketGateway`) — JWT handshake guard; clients subscribe to symbol rooms; broadcasts `price.update` from `StockEventsService` to the matching Socket.IO room

### App
- [ ] `src/shared/constants/stocks.ts` — hardcoded watchlist of tracked symbols (AAPL, MSFT, GOOGL, TSLA, AMZN, META, NVDA); this drives the stock list and is used as the default symbol set for WebSocket subscriptions
- [ ] `src/realtime/socket.service.ts` — Socket.IO client singleton (connects with auth token)
- [ ] `src/realtime/hooks/use-stock-socket.ts` — subscribes to symbol list from `stocks.ts`, writes to Zustand on `price.update`
- [ ] `src/features/stocks/stocks.store.ts` — Zustand store `{ [symbol]: { price, timestamp } }`
- [ ] `src/features/stocks/api/stocks.api.ts` — Axios calls for search, quote, candles
- [ ] `src/features/stocks/hooks/use-stocks.ts` — TanStack Query (initial quote fetch, sparkline candle data)
- [ ] `src/features/stocks/screens/dashboard-screen.tsx` — flat list of tracked symbols; shows live price from Zustand
- [ ] `src/features/stocks/components/stock-list-item.tsx` — single row with symbol, live price, change indicator, and inline `StockSparkline`
- [ ] `src/features/stocks/components/stock-sparkline.tsx` — small inline line chart (react-native-gifted-charts) showing 7-day price movement; satisfies Requirement 4 "Graphic of all Stocks" at the list level
- [ ] `app/(tabs)/index.tsx` — route wrapper for dashboard
- [ ] `app/(tabs)/_layout.tsx` — bottom tab navigator

**Checkpoint:** Dashboard shows a list of stocks, each with a live price and a small sparkline chart. Prices update in real time as Finnhub sends data.

---

## Phase 3 — Stock Detail & Chart

**Goal:** Tapping a stock opens a detail screen with a historical price chart.

### API
- [ ] `GET /stocks/:symbol/candles` already supports `resolution` and `days` params from Phase 2; verify the response shape matches what `react-native-gifted-charts` expects (array of `{ open, high, low, close, timestamp }`)


### App
- [ ] Install chart dependencies: `react-native-gifted-charts`, `react-native-svg`, `expo-linear-gradient` (replaces `react-native-linear-gradient` for Expo managed workflow)
- [ ] `src/features/stocks/screens/stock-detail-screen.tsx` — full candlestick or line chart (react-native-gifted-charts); fetches candle data via TanStack Query; shows live price from Zustand at the top
- [ ] `src/features/stocks/components/stock-chart.tsx` — encapsulates chart rendering with configurable time range (1W / 1M / 3M)
- [ ] `app/stocks/[symbol].tsx` — dynamic route wrapper
- [ ] Wire up navigation from `StockListItem` → detail screen; add "Create Alert" button on detail screen (links to Phase 4)

**Checkpoint:** Tapping a stock opens a full-screen chart with configurable time range. The stock list sparklines are already visible from Phase 2.

---

## Phase 4 — Alerts (CRUD)

**Goal:** Users can create price alerts and see a list of their active alerts.

### API
- [ ] `alerts/` — `StockAlert` entity; TypeORM migration `create_stock_alerts_table`
- [ ] `alerts/alerts.repository.ts` — TypeORM implementation (sole `@InjectRepository` consumer in alerts module); methods: `create`, `findAllByUserId`, `findByIdAndUserId`, `delete`, `findUntriggeredBySymbolAndPrice`, `markTriggered`
- [ ] `alerts/` — `AlertsService` (create, findAllByUser, delete) — business logic only; inject `AlertsRepository`
- [ ] `alerts/` — `AlertsController`:
  - `POST /alerts`
  - `GET /alerts`
  - `DELETE /alerts/:id`
- [ ] All endpoints protected by `JwtAuthGuard`; user scoped via `@CurrentUser()` decorator

### App
- [ ] `src/features/alerts/api/alerts.api.ts` — Axios calls
- [ ] `src/features/alerts/hooks/use-alerts.ts` — TanStack Query (list, create mutation, delete mutation)
- [ ] `src/features/alerts/screens/alerts-screen.tsx` — list of user's alerts
- [ ] `src/features/alerts/screens/create-alert-screen.tsx` — symbol + target price form
- [ ] `src/features/alerts/components/alert-list-item.tsx` — single alert row with delete action
- [ ] `app/(tabs)/alerts.tsx` — route wrapper
- [ ] Add "Create Alert" shortcut from `StockDetailScreen`

**Checkpoint:** Users can create, view, and delete price alerts through the app.

---

## Phase 5 — Alert Price Checking & FCM Notifications

**Goal:** When a stock price crosses an alert threshold, a push notification is sent to the user's device.

### API
- [ ] `notifications/` — `FirebaseService` (initialize `firebase-admin` from env; wrap `messaging.send()`)
- [ ] `notifications/` — `NotificationsService` (`sendPriceAlert(fcmToken, symbol, price)`)
- [ ] `alerts/alert-checker.service.ts` — subscribes to `price.update` events from `StockEventsService`; uses `AlertsRepository` (not TypeORM directly) to find untriggered alerts and mark them triggered; calls `NotificationsService`
- [ ] Ensure `AlertsModule` imports `NotificationsModule` and `RealtimeModule`

### App
- [ ] `src/notifications/notification.service.ts` — request FCM permission on startup; get token; register `setBackgroundMessageHandler`; foreground `onMessage` handler
- [ ] On successful login/register: call `PATCH /users/me/fcm-token` with the device token
- [ ] Handle incoming notifications (foreground: in-app toast or banner; background: native notification)

**Checkpoint:** Set an alert, wait for the price to cross the threshold (or manually trigger via a test endpoint), and receive a push notification on the device.

---

## Phase 6 — Polish & UX

**Goal:** Consistent UI, loading states, error handling, empty states.

### API
- [ ] Verify the global `HttpExceptionFilter` (set up in Phase 1) produces a consistent `{ statusCode, message, error }` shape across all modules
- [ ] Audit all DTOs for complete `class-validator` coverage — the global `ValidationPipe` is already active; this step ensures no fields were left unvalidated during feature development
- [ ] Rate limiting on auth endpoints (`@nestjs/throttler`)

### App
- [ ] `src/shared/theme/` — colors, typography, spacing constants
- [ ] `src/shared/components/` — `Button`, `Input`, `Card`, `LoadingSpinner`, `EmptyState`
- [ ] Loading and error states for all TanStack Query usages
- [ ] Pull-to-refresh on stock list and alerts list
- [ ] Optimistic UI for alert deletion

**Checkpoint:** App feels production-quality: no raw loading spinners, all error states are handled gracefully.

---

## Phase 7 — Testing

**Goal:** Key business logic covered by unit tests; at least one integration test per module.

### API
- [ ] `AuthService` — unit tests for login (valid credentials, invalid credentials, wrong password)
- [ ] `AlertCheckerService` — unit tests for price threshold logic (crosses threshold, does not cross, already triggered)
- [ ] `NotificationsService` — unit test with mocked Firebase Admin
- [ ] `AlertsController` — integration test using NestJS `Test.createTestingModule`

### App
- [ ] `use-auth.ts` hook — unit test with mocked Axios
- [ ] `auth.store.ts` — unit test for store actions

---

## Phase 8 — Docker & Final Documentation

**Goal:** API runs in Docker; project is fully documented for the reviewer.

### Docker
- [ ] `api/Dockerfile` — multi-stage build (build stage → production stage with `node:alpine`)
- [ ] `docker-compose.yml` at `api/` root — services: `api`, `postgres`; volumes for DB persistence; `.env` file injection
- [ ] Verify `npm run start:prod` works inside the container

### Documentation
- [ ] `README.md` at repository root with:
  - Project overview and features
  - Prerequisites (Node version, Expo CLI, Docker)
  - Setup instructions for API (env vars, migrations, run locally, run with Docker)
  - Setup instructions for App (env vars, Expo run, FCM setup notes)
  - Architecture summary (brief, link to `docs/architecture.md`)
  - API endpoint reference (or link to Swagger at `/api/docs`)

---
