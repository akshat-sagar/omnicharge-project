# RechargeNow — Frontend

A production-grade React + TypeScript frontend for the mobile recharge platform, built to the full standards outlined in the implementation document.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS + Material UI v5 |
| Animation | Framer Motion |
| HTTP Client | Axios (with interceptors) |
| State Management | Redux Toolkit |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Toast | React Hot Toast |
| Icons | Google Material Icons Round |
| Build | Vite |
| Container | Docker + Nginx |

---

## Project Structure

```
src/
├── components/
│   ├── ui/             # Shared reusable components (Button, Input, Card, Modal, Table, etc.)
│   ├── layout/         # MainLayout (sidebar + topbar), AuthLayout
│   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   ├── dashboard/      # Dashboard, Profile
│   ├── recharge/       # RechargePage (stepper), MyRecharges, Transactions
│   └── admin/          # Users, Operators, Plans, All Recharges
├── hooks/              # Custom hooks (extendable)
├── services/           # api.ts (axios + interceptors), authService, userService, etc.
├── store/              # Redux store + slices
├── types/              # All TypeScript interfaces matching your OpenAPI specs
├── routes/             # AppRoutes, guards (ProtectedRoute, AdminRoute, GuestRoute)
├── utils/              # validationSchemas (Zod), helpers (formatCurrency, etc.)
└── styles/             # globals.css (Tailwind base + overrides)
```

---

## Quick Start

### 1. Clone and install

```bash
cd mobile-recharge-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_GATEWAY=http://localhost:8087
VITE_RAZORPAY_KEY=rzp_test_your_key_here
```

### 3. Run development server

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## Docker Deployment

```bash
# Build image
docker build -t rechargenow-frontend .

# Run container
docker run -p 80:80 rechargenow-frontend
```

---

## API Gateway

All API calls route through **port 8087** (API Gateway). The services map to:

| Service | Port | Routes |
|---|---|---|
| Auth Service | 8089 | `/auth/*` |
| User Management | 8081 | `/users/*` |
| Operator/Plan | 8086 | `/operators/*`, `/plans/*` |
| Recharge Processing | 8083 | `/recharge/*` |
| Payment Service | 8084 | `/transaction/*` |
| Notification Service | 8085 | `/notify/*` |

---

## Features

### Authentication
- Login with email + password (JWT)
- Register with full validation (password strength, email format, mobile regex)
- Forgot password → OTP via email → Reset password
- Auto token refresh (interceptor-based)
- Role-based routing (USER vs ADMIN)
- Session stored in `sessionStorage` (cleared on tab close)

### User Flow
- **Dashboard** — stats, quick actions, recent recharges
- **Recharge** — 4-step flow: Operator → Plan → Payment details → Confirm & Pay
- **My Recharges** — filterable list with status badges
- **Transactions** — payment history
- **Profile** — edit name, email, mobile

### Admin Flow
- **Users** — list all, toggle roles (USER ↔ ADMIN), delete
- **Operators** — full CRUD with modal forms
- **Plans** — full CRUD with operator filter, pagination
- **All Recharges** — paginated table, inline status update

### UI/UX
- Fully responsive (mobile → tablet → desktop)
- No component overlap at any breakpoint
- Framer Motion page and list animations
- Form validation with inline real-time error messages
- Toast notifications for all actions
- Loading states, empty states, error states throughout
- Google Material Icons Round (no emojis)
- Clean enterprise color palette (slate + blue)

---

## Validation Rules

| Field | Rule |
|---|---|
| Email | Must contain `@` and valid domain |
| Password (register) | 8–20 chars, uppercase, lowercase, number, special char |
| Mobile | 10-digit Indian number starting with 6–9 |
| OTP | 4–8 chars |
| Operator name | 2–50 chars |
| Plan amount | Minimum ₹1 |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_GATEWAY` | Base URL for API Gateway (default: `http://localhost:8087`) |
| `VITE_RAZORPAY_KEY` | Razorpay public key for payment |

---

## Razorpay Integration

The payment flow:
1. User selects plan + payment method → Recharge created (`POST /recharge/add-recharge`)
2. Razorpay order created (`POST /transaction/create-order`)
3. Razorpay SDK opens checkout modal
4. On success, payment verified (`POST /transaction/verify`)

To use live payments, add the Razorpay SDK to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Test Card Input

When the app is configured with a Razorpay test key, use Razorpay's test card flow:
1. Select `Card` in checkout.
2. Enter any future expiry date.
3. Enter any random CVV.
4. Complete the OTP step shown by Razorpay after you click `Pay`.

The exact test card numbers are documented in Razorpay's official test-card docs.
