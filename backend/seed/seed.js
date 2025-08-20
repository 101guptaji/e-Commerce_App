import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { connectDB } from "../db/config.js";

dotenv.config();

const productsData = [
  { name: "Classic T-Shirt", category: "Apparel", price: 499, description: "100% cotton", stock: 50 },
  { name: "Blue Jeans", category: "Apparel", price: 1499, description: "Slim fit denim", stock: 40 },
  { name: "Wireless Mouse", category: "Electronics", price: 899, description: "2.4GHz USB receiver", stock: 70 },
  { name: "Water Bottle", category: "Home", price: 299, description: "Steel 750ml", stock: 100 },
  { name: "Notebook", category: "Stationery", price: 99, description: "A5 ruled, 100 pages", stock: 200 }
];

async function seed() {
  try {
    await connectDB();

    // Clean
    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);

    // Users
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const customerPassword = await bcrypt.hash("Customer@123", 10);

    const [admin, customer] = await User.create([
      { name: "Admin User", email: "admin@ecommerce.com", password: adminPassword, role: "admin" },
      { name: "Customer User", email: "customer@ecommerce.com", password: customerPassword, role: "customer" }
    ]);

    console.log("Users created:", admin.email, customer.email);

    // Products
    const products = await Product.create(productsData);
    console.log(`Inserted ${products.length} products`);

    // create empty carts
    await Cart.create([{ user: admin._id, items: [] }, { user: customer._id, items: [] }]);
    console.log("Empty carts created");

    console.log("Seeding done.");
    process.exit(0);
  } 
  catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
