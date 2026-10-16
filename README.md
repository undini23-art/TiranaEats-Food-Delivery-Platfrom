# TiranaEats Food Delivery E-Commerce Prototype

TiranaEats is a university project prototype for a B2C food delivery platform in Tirana. It simulates a real digital business with restaurant browsing, cart management, checkout, authentication, order status updates, and analytics.

## Business Concept

- **Business type:** B2C food delivery website
- **Target audience:** People ordering food online in Tirana
- **Value proposition:** Fast, simple, reliable ordering with simulated real-time order tracking
- **Revenue model:** 15% commission per simulated order
- **Transaction flow:** Browsing -> selecting products -> cart -> checkout -> simulated payment -> manager/admin status updates

## Project Structure

```text
/frontend              React + Vite + Tailwind website
/backend               Node.js + Express API
/backend/data          JSON mock data for users, restaurants, menu items, orders
```

## Features

- Restaurant homepage with search and cuisine filters
- Restaurant detail pages with menu products
- Customer restaurant reviews with star ratings, comments, and delete controls for review owners/admin
- OpenStreetMap integration for restaurant locations and delivery address lookup
- Persistent cart using `localStorage`
- Add, remove, and update cart item quantities
- Checkout with simulated payment method
- Smart scheduling for later delivery, including quick lunch scheduling at 12:30
- Rewards system where customers earn points per order and redeem them for discounts, free delivery, or a free meal reward
- Simulated payment options: Visa/Mastercard card, PayPal, and cash on delivery
- Advanced payment simulation:
  - Card, cash, PayPal, and digital wallet payments
  - Split payments between users
  - Promo codes: `FOOD10`, `LUNCH20`, and `WALLET5`
  - Cashback balance for wallet cashback promotions
- Login/register with JWT session simulation
- Extra security verification code for admin and restaurant manager login
- Protected customer, admin, and restaurant routes
- Notification center for customers, admins, and restaurant managers
- Customer profile with personal order history button and order summary
- Customer profile shows available reward points
- Budget and nutrition tracking for customers:
  - Monthly food spending
  - Configurable monthly food budget
  - Approximate calories for menu items and each order
- Orders page with auto-refreshing status updates after manager/admin changes
- Customers can cancel orders while they are `pending`; `preparing`, `delivering`, and `delivered` orders cannot be cancelled
- 5-minute courier map simulation appears after the order is marked as `delivering`; after 5 minutes the backend automatically marks it `delivered`
- Admin Dashboard with simulated KPIs:
  - Number of orders
  - Commission revenue
  - Conversion rate
  - Visitors
  - Checkout starts
  - Average order value
- Restaurant Dashboard for managing order statuses manually
- Login page demo buttons for client, restaurant manager, and admin access
- Restaurant managers can choose which restaurant they manage during login
- New immediate orders start as `pending`; scheduled orders start as `scheduled` and automatically become `pending` at the selected time
- Admin or restaurant manager changes active orders to `preparing`, `delivering`, and `delivered`
- Responsive modern food delivery UI

## Demo Accounts

```text
Customer: arta@example.com / password123
Admin: admin@example.com / admin123 / security code ADMIN-2026
Restaurant manager: manager@example.com / manager123 / security code MANAGER-2026
```

On the login page, use the demo role buttons to fill the account details. Admin and manager login requires the extra security verification code. When you choose **Login as manager**, select the restaurant from the dropdown before logging in.

Because authentication uses browser `sessionStorage`, you can open different browser tabs and log in with different accounts at the same time. This is useful for demos: keep one tab as the customer and another tab as admin or restaurant manager to watch order status updates live.

## Run The Project

Install backend dependencies:

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:4000
```

Install frontend dependencies in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The website runs at:

```text
http://localhost:5173
```

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/menu-items`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/cancel`
- `GET /api/rewards`
- `GET /api/payment-options`
- `GET /api/notifications`
- `PATCH /api/notifications/read`
- `GET /api/analytics`
- `GET /api/restaurant/orders`
- `PATCH /api/restaurant/orders/:id/status`

## Mock Data

The API uses JSON files from `/backend/data`:

- `users.json`
- `restaurants.json`
- `menuItems.json`
- `orders.json`

No database is required. New users and orders are stored in memory while the server is running.
