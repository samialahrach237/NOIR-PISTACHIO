# Noir & Pistachio API

Base URL: `http://127.0.0.1:8000/api`

All successful responses use `{ "success": true, "message": "...", "data": ... }`. Validation errors use HTTP `422` and an `errors` object. Bearer tokens are returned by login/register and should be sent as `Authorization: Bearer <token>`.

## Public

| Method | URL | Auth | Purpose |
|---|---|---|---|
| GET | `/categories` | No | List menu categories |
| GET | `/products` | No | List available products; optional `?category=coffee` |
| GET | `/products/featured` | No | Return the featured signature drink |
| GET | `/products/{id}` | No | Product detail |
| GET | `/gallery` | No | Active gallery images |
| GET | `/reviews` | No | Approved reviews |
| POST | `/contact` | No | Store `{name,email,phone?,message}` |
| POST | `/reservations` | Optional | Store reservation details and validate date/time/guest count |

## Authentication

- `POST /register`: `{name,email,password,password_confirmation,phone?}`
- `POST /login`: `{email,password}`
- `POST /logout`: authenticated; revokes the current token
- `GET /user`: authenticated; returns the current user

## Customer Orders

- `POST /orders`: authenticated; `{customer_name,customer_email,customer_phone,notes?,items:[{product_id,quantity}]}`. Prices and totals are recalculated server-side.
- `GET /orders`: authenticated; returns the current customer's orders and item products.
- `GET /orders/{id}`: authenticated owner only.
- `PATCH /orders/{id}/cancel`: authenticated owner; pending orders only.

## Customer Reservations and Reviews

- `GET /reservations`: authenticated customer's reservations.
- `PATCH /reservations/{id}/cancel`: authenticated owner; pending reservations only.
- `POST /reviews`: authenticated; `{rating:1-5,comment}`. Reviews require admin approval before appearing publicly.

## Admin

Admin endpoints require a Sanctum bearer token for a user with `role=admin`.

- `GET /admin/stats`
- `GET|POST /admin/products`
- `PUT|DELETE /admin/products/{id}`
- `GET|POST /admin/categories`
- `GET /admin/orders`; `PATCH /admin/orders/{id}` with `{status}`
- `GET /admin/reservations`; `PATCH /admin/reservations/{id}` with `{status}`
- `GET /admin/reviews`; `PATCH /admin/reviews/{id}` with `{is_approved}`
- `GET|POST /admin/gallery`
- `GET /admin/messages`; `PATCH /admin/messages/{id}` with `{status}`

## Seed credentials

Admin: `admin@noir-pistachio.test` / `Admin123!`

Customer: `sara@example.com` / `Customer123!`
