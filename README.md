# 🛒 Simple E-Commerce Application (MERN Stack)

A simple e-commerce web application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with role-based authentication and basic shopping features.

---

## 🚀 Features

### 👤 Authentication & Authorization
- JWT-based authentication
- Two roles:
  - **Customer**: View products, manage cart, place orders
  - **Admin**: Full product management (add, update, delete)

### 📦 Products
- Product listing with pagination
- Search by name or category
- Admin can add, update, and delete products

### 🛒 Cart
- Add items to cart
- Update item quantities
- Remove items
- Stock validation at both the cart and order level

### 📑 Orders
- Create an order from the cart
- Deduct stock atomically during order creation
- Store purchase price at order time

---

├── backend
│ ├── controllers # Business logic
│ ├── middleware # Auth middleware
│ ├── models # Mongoose models
│ ├── routes # API routes
│ ├── seed # Seed script for dummy data
│ ├── server.js # Express server
│ └── config/db.js # MongoDB connection
│
├── frontend
│ ├── index.html # Basic HTML page
│ ├── scripts.js # Frontend JS (fetch API)
│ └── styles.css # Basic styles
│
└── README.md

## ⚙️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens)
- **Other**: bcryptjs, dotenv, nodemon

---

## 📦 Installation & Setup
```bash
### 1️⃣ Clone Repository
git clone https://github.com/101guptaji/e-Commerce_App.git
cd e-Commerce_App

# Backend
cd backend
npm install

# Frontend 
index.html

3️⃣ Setup Environment Variables

Create a .env file in backend/:
PORT=8080
MONGO_ALTAS_URL="mongodb+srv://username:password@hgcluster1.bdq61.mongodb.net/eCommerceDB"
JWT_SECRET=your_secret_key

4️⃣ Seed Dummy Data
cd backend
node seed/seed.js

5️⃣ Run Application
# Run backend
cd backend
npm run dev

# Open frontend
cd frontend
open index.html   # or just open in browser
```

## 🧪 API Endpoints
## Auth
-  POST /api/auth/register → Register user
-  POST /api/auth/login → Login user

## Products
-  GET /api/products → List products (with pagination & search)
-  POST /api/products → Add product (admin only)
-  PUT /api/products/:id → Update product (admin only)
-  DELETE /api/products/:id → Delete product (admin only)

## Cart
-  GET /api/cart → Get user cart
-  POST /api/cart → Add product to cart
-  PUT /api/cart/:itemId → Update cart item quantity
-  DELETE /api/cart/:itemId → Remove cart item

## Orders
-  GET /api/order → get all orders
-  POST /api/orders → Create new order
