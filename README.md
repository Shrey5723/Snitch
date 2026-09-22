# 👟 Snitch — Urban Couture & Luxury Apparel

A full-stack e-commerce platform for urban fashion and luxury apparel, built with the **MERN stack**. Snitch provides a complete shopping experience with separate **Buyer** and **Seller** flows, Google OAuth integration, image uploads via ImageKit, and a modern dark-themed React UI.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI library (latest with concurrent features) |
| **Vite 8** | Build tool & dev server with HMR |
| **Tailwind CSS 4** | Utility-first CSS framework (via `@tailwindcss/vite`) |
| **Redux Toolkit** | Global state management (auth, products, cart) |
| **React Router 7** | Client-side routing with protected routes |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Icon library |
| **Three.js** | 3D graphics / visual effects |
| **Google Fonts** | Typography — Inter, Montserrat, Plus Jakarta Sans |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework |
| **MongoDB + Mongoose 9** | NoSQL database & ODM |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **Passport.js** | Google OAuth 2.0 social login |
| **bcryptjs** | Password hashing |
| **ImageKit (Node SDK)** | Cloud image storage & CDN delivery |
| **Multer** | Multipart form-data / image upload handling |
| **express-validator** | Request body & param validation |
| **Morgan** | HTTP request logger |
| **cookie-parser** | Parse JWT tokens from cookies |
| **dotenv** | Environment variable management |
| **Nodemon** | Dev-mode auto-restart |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React)                     │
│                                                         │
│  React Router ─► Pages ─► Custom Hooks ─► API Services  │
│                                 │                       │
│                          Redux Store                    │
│                    (auth / products / cart)              │
└─────────────────────┬───────────────────────────────────┘
                      │  Axios (HTTP) / Vite Proxy
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER (Express 5)                    │
│                                                         │
│  Routes ─► Middleware (JWT/Role) ─► Controllers          │
│                                         │               │
│                              ┌──────────┴──────────┐    │
│                              │                     │    │
│                         Mongoose ODM          ImageKit   │
│                              │                 (CDN)    │
│                              ▼                          │
│                          MongoDB Atlas                  │
└─────────────────────────────────────────────────────────┘
```

**Key architectural patterns:**
- **Feature-based frontend** — code is organized by domain (`auth`, `products`), each with its own pages, hooks, services, state, and components.
- **MVC backend** — separation into models, controllers, routes, middleware, validators, and services.
- **JWT + Cookie auth** — tokens are stored as HTTP cookies and sent via `Authorization` header as a fallback.
- **Role-based access control** — `protect` middleware verifies auth; `authorizeRole` restricts endpoints to `buyer` or `seller`.

---

## ✨ Features

### 🔐 Authentication
- Email & password registration with validation
- Login with JWT-based sessions (cookie + header)
- **Google OAuth 2.0** sign-in via Passport.js
- Profile management (update name, contact, addresses)
- Automatic session restoration on app load (`getMe`)

### 🛍 Buyer Experience
- Browse all products with a premium dark-themed UI
- View detailed product pages (images, sizes, colors, reviews)
- Add to cart with size & color selection
- Quantity management in cart
- Place orders with shipping address
- View order history
- **Wishlist** — like/unlike products
- Rate and review products (1–5 stars + comment)

### 📦 Seller Experience
- **Seller Dashboard** — overview of listed products
- Create new products with:
  - Multiple image uploads (up to 7 per product, 10 MB each)
  - Size-wise stock management (S / M / L / XL / XXL)
  - Color variants, categories, pricing (INR)
  - Build summary & product type
- Edit existing product details
- View individual product performance
- Role-gated routes (only sellers can access)

### 🖼 Image Management
- Client-side image upload via `multipart/form-data`
- Server-side handling with **Multer** (memory storage)
- Cloud upload & CDN delivery via **ImageKit**

---

## 📁 Project Structure

```
Snitch/
├── Backend/
│   ├── server.js                     # Entry point — starts Express + DB
│   ├── package.json
│   ├── .env.example                  # Environment variable template
│   └── src/
│       ├── app.js                    # Express app setup, middleware, routes
│       ├── config/
│       │   ├── config.js             # Centralized env config with validation
│       │   ├── db.js                 # MongoDB connection
│       │   └── passport.js           # Google OAuth strategy
│       ├── controllers/
│       │   ├── auth.controller.js    # Register, login, logout, profile, Google callback
│       │   ├── product.controller.js # CRUD, search, ratings, likes
│       │   ├── cart.controller.js    # Add, update, remove, clear cart
│       │   └── order.controller.js   # Place order, order history
│       ├── middleware/
│       │   └── auth.middleware.js     # JWT protect + role-based authorization
│       ├── models/
│       │   ├── user.model.js         # User schema (buyer/seller, addresses, wishlist)
│       │   ├── product.model.js      # Product schema (sizes, colors, ratings, images)
│       │   ├── cart.model.js          # Cart schema (per-user, item list)
│       │   └── order.model.js        # Order schema (items, address, status tracking)
│       ├── routes/
│       │   ├── auth.route.js
│       │   ├── product.route.js
│       │   ├── cart.route.js
│       │   └── order.route.js
│       ├── services/
│       │   └── storage.service.js    # ImageKit upload utility
│       ├── validator/
│       │   ├── auth.validator.js     # Registration & login validators
│       │   └── product.validator.js  # Product creation validators
│       └── scripts/
│           └── seed.js               # Database seeder script
│
├── Frontend/
│   ├── index.html                    # Root HTML (dark theme, Google Fonts)
│   ├── vite.config.js                # Vite + React + Tailwind + API proxy
│   ├── package.json
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── index.css                 # Global styles
│       ├── app/
│       │   ├── App.jsx               # Root component (auth restore, cart sync)
│       │   ├── App.css
│       │   ├── app.routes.jsx        # Route definitions (public + protected)
│       │   └── app.store.js          # Redux store (auth, products, cart slices)
│       └── features/
│           ├── auth/
│           │   ├── pages/            # Login, Register, Profile
│           │   ├── components/       # AuthLayout, Protected (route guard)
│           │   ├── Hooks/            # useAuth (login, register, getMe, logout)
│           │   ├── services/         # auth.api.js (Axios calls)
│           │   └── state/            # auth.slice.js (Redux)
│           └── products/
│               ├── pages/            # Home, ProductDetail, Cart, CreateProduct,
│               │                     # SellerDashboard, SellerProductDetails,
│               │                     # ViewAllProducts
│               ├── components/       # (shared product UI components)
│               ├── Hooks/            # useProduct (CRUD + search hooks)
│               ├── services/         # product.api.js, cart.api.js
│               └── state/            # product.slice.js, cart.slice.js (Redux)
│
├── .gitignore
└── README.md
```

---

## 🗄 Database Models

### User
| Field | Type | Notes |
|---|---|---|
| `email` | String | Unique, lowercase |
| `password` | String | Hashed with bcrypt (not required for Google users) |
| `fullName` | String | Required |
| `contactNumber` | String | Not required for Google users |
| `role` | Enum | `buyer` or `seller` |
| `addresses` | Array | Label, street, city, state, zipCode, isDefault |
| `googleId` | String | For OAuth users |
| `avatar` | String | Profile image URL |
| `wishlist` | ObjectId[] | Refs to liked products |

### Product
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `seller` | ObjectId | Ref to user |
| `price` | Object | `{ amount, currency: 'INR' }` |
| `category` | String | Default: `Shirts` |
| `stock` | Number | Total stock count |
| `sizeStock` | Object | `{ S, M, L, XL, XXL }` |
| `status` | Enum | `In Stock`, `Low Stock`, `Out of Stock`, `Archived` |
| `colors` | String[] | Available color variants |
| `images` | Array | `{ url, alt }` (hosted on ImageKit) |
| `ratings` | Array | `{ user, rating, comment, createdAt }` |
| `avgRating` / `numReviews` | Number | Aggregated rating stats |

### Cart
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | One cart per user (unique) |
| `items` | Array | `{ product, quantity, size, color }` |

### Order
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Buyer who placed the order |
| `orderNumber` | String | Unique order identifier |
| `items` | Array | `{ product, title, price, quantity, size, color, image }` |
| `totalAmount` | Number | Order total |
| `shippingAddress` | Object | `{ street, city, state, zipCode }` |
| `status` | Enum | `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled` |

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Login & receive JWT cookie |
| `POST` | `/logout` | Public | Clear auth cookie |
| `GET` | `/get-me` | Authenticated | Get current user profile |
| `PUT` | `/update-profile` | Authenticated | Update profile details |
| `GET` | `/google` | Public | Initiate Google OAuth |
| `GET` | `/google/callback` | Public | Google OAuth callback |

### Products — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/all` | Public | Get all products |
| `GET` | `/seller` | Seller | Get seller's own products |
| `GET` | `/liked` | Buyer | Get buyer's wishlist |
| `GET` | `/:productId` | Public | Get product by ID |
| `POST` | `/` | Seller | Create product (with images) |
| `PUT` | `/:productId` | Seller | Update product details |
| `POST` | `/:productId/like` | Buyer | Toggle like/unlike |
| `POST` | `/:productId/rate` | Buyer | Submit a rating & review |

### Cart — `/api/cart`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Buyer | Get user's cart |
| `POST` | `/add` | Buyer | Add item to cart |
| `PUT` | `/update` | Buyer | Update item quantity/size/color |
| `POST` | `/remove` | Buyer | Remove item from cart |
| `DELETE` | `/clear` | Buyer | Clear entire cart |

### Orders — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Buyer | Place a new order |
| `GET` | `/my-orders` | Buyer | Get order history |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **ImageKit** account for image uploads — [imagekit.io](https://imagekit.io)
- *(Optional)* Google Cloud Console project for OAuth credentials

### 1. Clone the Repository

```bash
git clone https://github.com/Shrey5723/Snitch.git
cd Snitch
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

Start the server:

```bash
npm run dev
```

The backend runs on **http://localhost:3000**.

### 3. Setup Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173** and proxies `/api` requests to the backend.

### 4. *(Optional)* Seed the Database

```bash
cd Backend
node src/scripts/seed.js
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 2.0 client secret |
| `GOOGLE_CALLBACK_URL` | ✅ | OAuth callback URL |
| `IMAGEKIT_PRIVATE_KEY` | ✅ | ImageKit private API key |
| `PORT` | ❌ | Backend port (defaults to `3000`) |

---

## 📜 Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start server with Nodemon (hot-reload) |
| `node src/scripts/seed.js` | Seed database with sample data |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📄 License

ISC

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
