import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } 
  catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) 
        return res.status(400).json({ message: "productId required" });
    if (quantity < 1) 
        return res.status(400).json({ message: "quantity must be >= 1" });

    const product = await Product.findById(productId);
    if (!product) 
        return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) 
        return res.status(400).json({ message: "Insufficient stock" });

    const cart = await getOrCreateCart(req.user.id);

    const idx = cart.items.findIndex(i => i.product._id.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity += Number(quantity);
    } 
    else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(201).json(cart);
  } 
  catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) 
        return res.status(400).json({ message: "quantity must be >= 1" });

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);
    if (!item) 
        return res.status(404).json({ message: "Cart item not found" });

    const product = await Product.findById(item.product);
    if (!product) 
        return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) 
        return res.status(400).json({ message: "Insufficient stock" });

    item.quantity = Number(quantity);
    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } 
  catch (err) {
    res.status(400).json({ message: "Bad request", error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.user.id);

    cart.items = cart.items.filter((item)=>item.id != itemId);
    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } 
  catch (err) {
    res.status(400).json({ message: "Bad request", error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } 
  catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
