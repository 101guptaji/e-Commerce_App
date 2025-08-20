import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrderFromCart = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const cart = await Cart.findOne({ user: req.user.id })
            .populate("items.product")
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = [];
        let total = 0;

        for (const item of cart.items) {
            const p = item.product;
            if (!p) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Product missing: ${item.product?._id || "unknown"}` });
            }
            if (item.quantity < 1) {
                await session.abortTransaction();
                return res.status(400).json({ message: `Invalid quantity for ${p.name}` });
            }
            if (p.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
            }

            total += item.quantity * p.price;

            orderItems.push({
                product: p._id,
                quantity: item.quantity,
                priceAtPurchase: p.price
            });
        }

        // Deduct stock atomically using conditional updates inside the same transaction
        const bulkOps = cart.items.map((item) => ({
            updateOne: {
                filter: { _id: item.product._id, stock: { $gte: item.quantity } },
                update: { $inc: { stock: -item.quantity } }
            }
        }));

        if (bulkOps.length > 0) {
            const bulkResult = await Product.bulkWrite(bulkOps, { session });
            // console.log("bulkResult: ", bulkResult);

            if (Number(bulkResult.matchedCount) !== bulkOps.length) {
                await session.abortTransaction();
                return res.status(409).json({ message: "Stock changed while ordering. Please refresh and try again." });
            }
        }

        // Create order
        const order = await Order.create(
            [
                {
                    user: req.user.id,
                    items: orderItems,
                    totalAmount: total
                }
            ],
            { session }
        );

        // Clear cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        // console.log(order)

        return res.status(201).json(order[0]);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
    finally {
        session.endSession();
    }
};
export const getOrders = async (req, res) => {
    try {
        const filter = req.user.role === "admin" ? {} : { user: req.user.id };
        const orders = await Order.find(filter).sort({ createdAt: -1 })
            .populate("items.product")
            .populate("user", "email role");

        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
