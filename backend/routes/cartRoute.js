import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";

const router = Router();

router.get("/", auth(["customer", "admin"]), getCart);
router.post("/", auth(["customer", "admin"]), addToCart);
router.put("/:itemId", auth(["customer", "admin"]), updateCartItem);
router.delete("/:itemId", auth(["customer", "admin"]), removeCartItem);
router.delete("/", auth(["customer", "admin"]), clearCart);

export default router;