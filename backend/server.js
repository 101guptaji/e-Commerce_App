import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./db/config.js";
import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js'
import cartRoutes from './routes/cartRoute.js'
import orderRoutes from './routes/orderRoute.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

app.get('/', (req, res)=>res.send("Welcome to E-Commerce backend"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Global error shield
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>console.log("Server is running on PORT: "+PORT));
