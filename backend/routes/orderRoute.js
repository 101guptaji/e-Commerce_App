import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createOrderFromCart, getOrders } from "../controllers/orderController.js";

const router = Router();

router.post("/", auth(["customer", "admin"]), createOrderFromCart);
router.get("/", auth(["customer", "admin"]), getOrders);

export default router;