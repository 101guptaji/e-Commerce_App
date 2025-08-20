import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", auth(["admin"]), createProduct);
router.put("/:id", auth(["admin"]), updateProduct);
router.delete("/:id", auth(["admin"]), deleteProduct);

export default router;