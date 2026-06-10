# Stock Tracker — Full Stack React Native + Node

A real-time stock tracking application built for the Designli take-home assessment. It consists of a **NestJS API** (`api/`) and a **React Native (Expo) mobile app** (`app/`) that share a single HTTP/WebSocket contract.

## Functional Requirements Coverage

| Requirement | Implementation |
|---|---|
| 1. User login | `POST /api/auth/login`, `POST /api/auth/register` — login screen at `app/src/features/auth/screens/login-screen.tsx` |
| 2. Stock price alert form | `POST /api/alerts` — create-alert screen at `app/src/features/alerts/screens/create-alert-screen.tsx` |
| 3. List of stocks | Hardcoded watchlist (`AAPL`, `MSFT`, `GOOGL`, `TSLA`, `AMZN`, `META`, `NVDA`) — dashboard at `app/src/features/stocks/screens/dashboard-screen.tsx` |
| 4. Graphic of all stocks | Sparkline per list row (`StockSparkline`) + full chart on detail screen (`StockChart`) |
| 5. FCM notification on price alert | `AlertCheckerService` → `NotificationsService` → Firebase Admin SDK |
| Extra: Docker deployment | `api/Dockerfile` + `api/docker-compose.yml` |

## Architecture

```
React Native App (Expo)          NestJS API
  Axios (REST)          ───────►  Auth / Stocks / Alerts modules
  Socket.IO (WS)        ───────►  RealtimeModule (StockGateway)
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
               PostgreSQL          Finnhub API          Firebase FCM
               (users, alerts)   (quotes, WS)         (push notifications)
                                        │
                                  Yahoo Finance
                                  (chart candles only)
```

For the full architecture document, see [docs/architecture.md](docs/architecture.md).

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeORM, PostgreSQL, Socket.IO |
| Auth | JWT (`@nestjs/jwt` + `passport-jwt`) |
| Real-time | Finnhub WebSocket → internal event bus → Socket.IO rooms |
| Push notifications | `firebase-admin` (server), `@react-native-firebase/messaging` (mobile) |
| Mobile | React Native + Expo (managed workflow), Expo Router |
| State | TanStack Query (server state), Zustand (client/live state) |
| Charts | `react-native-gifted-charts` |
| Containerization | Docker + docker-compose |

## Prerequisites

- **Node.js** 22+ and **pnpm**
- **PostgreSQL** 16 (local) or Docker
- **Finnhub API key** — [finnhub.io](https://finnhub.io) (free tier)
- **Firebase project** with FCM enabled (for push notifications)
- **Android Studio** + emulator (or physical device) for the mobile app
- **Docker** + Docker Compose (optional, for containerized API)

---

## Quick Start — API (local)

```bash
cd api
cp .env.example .env
# Fill in DATABASE_*, JWT_SECRET, FINNHUB_API_KEY, and Firebase credentials

pnpm install
pnpm migration:run
pnpm start:dev
```

The API starts at `http://localhost:3000`. Swagger docs are available at `http://localhost:3000/api/docs`.

---

## Quick Start — App (local)

```bash
cd app
pnpm install
```

Create `app/.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_WS_URL=http://10.0.2.2:3000
```

> Use `10.0.2.2` when running on the Android emulator (maps to host `localhost`). For a physical device on the same network, replace with your machine's LAN IP.

Copy `google-services.json.example` to `google-services.json` and fill in your Firebase project credentials.

```bash
pnpm android
```

> FCM requires a **native build** — it does not work in Expo Go. The `android/` folder is pre-generated for this purpose.

---

## Running the API with Docker

```bash
cd api
cp .env.example .env
# Fill in secrets (see Environment Variables below)

docker compose up --build
```

Migrations run automatically on container start via `entrypoint.sh`. The API is available at `http://localhost:3000/api/docs`.

> **Note:** `docker-compose.yml` overrides `DATABASE_HOST=postgres` so the API connects to the Postgres service. Your local `.env` can keep `DATABASE_HOST=localhost` for non-Docker development.

---

## Environment Variables

### API (`api/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default: `3000`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_HOST` | PostgreSQL host (`localhost` locally, `postgres` in Docker) |
| `DATABASE_PORT` | PostgreSQL port (default: `5432`) |
| `DATABASE_NAME` | Database name (default: `stocktracker`) |
| `DATABASE_USER` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default: `7d`) |
| `FINNHUB_API_KEY` | Finnhub API key |
| `FINNHUB_WS_URL` | Finnhub WebSocket URL (default: `wss://ws.finnhub.io`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |

> **Docker caveat:** `FIREBASE_PRIVATE_KEY` must be a single-line string with literal `\n` characters (not actual newlines) because Docker `.env` file parsing does not support multi-line values.

### App (`app/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | API base URL including `/api` prefix |
| `EXPO_PUBLIC_WS_URL` | WebSocket server URL (no `/api` suffix) |

---

## API Reference

Full interactive documentation: **http://localhost:3000/api/docs** (Swagger)

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access + refresh tokens |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/users/me/fcm-token` | Register device FCM token (protected) |

### Stocks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stocks/search?q=` | Symbol search (protected) |
| `GET` | `/api/stocks/:symbol/quote` | Current quote with 5s cache (protected) |
| `GET` | `/api/stocks/:symbol/candles?resolution=60&days=7` | OHLCV history for charts (protected) |

### Alerts

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/alerts` | Create a price alert (protected) |
| `GET` | `/api/alerts` | List user's alerts (protected) |
| `DELETE` | `/api/alerts/:id` | Delete an alert (protected) |
| `POST` | `/api/alerts/dev/simulate-price` | Simulate a price update for testing (dev only) |

### WebSocket

Connect to `EXPO_PUBLIC_WS_URL` with the JWT in the Socket.IO handshake. Emit `subscribe` with a symbol list; receive `price.update` events with `{ symbol, price, timestamp }`.

---

## Push Notification Setup (FCM)

### Backend

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Go to **Project Settings → Service Accounts → Generate new private key**.
3. Copy `project_id`, `client_email`, and `private_key` into `api/.env`.

### Mobile

1. In Firebase Console, add an Android app with package name `com.designli.test.stocktracker`.
2. Download `google-services.json` and place it at `app/google-services.json`.
3. Build and run with `pnpm android` (native build required).

### Testing notifications without waiting for market movement

Use the dev-only simulate endpoint after creating an alert:

```bash
curl -X POST http://localhost:3000/api/alerts/dev/simulate-price \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "price": 999.99}'
```

This emits a synthetic `price.update` event through the internal event bus, triggering the alert checker and FCM flow.

---

## Design Decisions & Trade-offs

### Yahoo Finance for chart data

Finnhub's `/stock/candle` endpoint requires a paid plan — the free tier returns `"no_data"` for historical OHLCV. Rather than show empty charts, `YahooFinanceService` was introduced as a parallel adapter used **exclusively for candle data**.

- `FinnhubService` — real-time quotes, symbol search, WebSocket trade data
- `YahooFinanceService` — OHLCV candles for sparklines and detail charts

The split is explicit in `StocksService`: `getQuote` → Finnhub, `getCandles` → Yahoo Finance. Swapping back to Finnhub requires a one-line change if the plan is upgraded.

### Dev simulate-price endpoint

`POST /api/alerts/dev/simulate-price` fires a synthetic `price.update` through `StockEventsService`, enabling end-to-end alert → notification testing without waiting for market movement. Guarded with a `NODE_ENV === 'production'` check.

### Stateless JWT refresh tokens

Refresh tokens are pure JWTs with no revocation table. A leaked refresh token remains valid until its 7-day expiry. Acceptable for this assessment scope; a production system would add a `refresh_tokens` table with one-time-use rotation.

### Hardcoded watchlist

A user-managed watchlist would require a `watchlist` table, additional CRUD endpoints, and more complex UI. The fixed 7-symbol list in `app/src/shared/constants/stocks.ts` covers the requirement while keeping focus on real-time updates and push notifications.

### Repository pattern

Controllers handle transport, services own business logic, and repositories own all database access. `@InjectRepository` is used only inside `*.repository.ts` files. External adapters (`FinnhubService`, `YahooFinanceService`, `FirebaseService`) are not repositories.

---

## Known Limitations

- **FCM requires a native build** — cannot run in Expo Go. The `android/` folder is pre-generated for the APK submission.
- **Refresh tokens cannot be revoked** before expiry (stateless JWT).
- **Alert triggering** fires on every price tick from the Finnhub WebSocket; during active market hours for popular symbols this can be several times per second.
- **iOS support is excluded** — requires a paid Apple Developer account for FCM entitlements.
- **Chart data source** — Yahoo Finance is an unofficial API with no SLA; it could break or rate-limit without notice.
- **Finnhub free tier** — intraday candle lookback is limited (~30 days); chart time ranges are constrained accordingly.

---

## What I Would Add With More Time

- Refresh token revocation table with family-based rotation
- User-managed watchlist (CRUD endpoints + UI)
- Alert re-arm flag — allow an alert to re-trigger on subsequent price crossings
- Redis-backed quote cache — replace the in-process `Map` in `StocksService` so cache survives restarts and scales across replicas
- E2E tests with Detox covering register → create alert → simulate price → receive notification
- CI/CD pipeline (GitHub Actions: lint → test → build → push Docker image)
- Pagination on `GET /api/alerts`
- iOS build with proper FCM entitlements
- Structured logging and observability (request tracing, alert trigger metrics)

---

## Project Structure

```
designli-test/
├── api/          NestJS backend (REST + WebSocket + FCM)
├── app/          React Native Expo mobile app
└── docs/
    ├── requirements.md
    ├── architecture.md
    └── implementation-plan.md
```

## Additional Documentation

- [Architecture & Design Decisions](docs/architecture.md)
- [Implementation Plan](docs/implementation-plan.md)
