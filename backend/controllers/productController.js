import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", category } = req.query;

        const query = {};
        if (search) query.name = { $regex: search, $options: "i" };
        if (category) query.category = category;

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
            products
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const p = await Product.findById(req.params.id);
        if (!p) 
            return res.status(404).json({ message: "Product not found" });
        res.json(p);
    } 
    catch (err) {
        res.status(400).json({ message: "Invalid id", error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, category, price, description, stock } = req.body;
        const p = await Product.create({ name, category, price, description, stock });
        res.status(201).json(p);
    } 
    catch (err) {
        res.status(400).json({ message: "Validation error", error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!p) 
            return res.status(404).json({ message: "Product not found" });
        res.json(p);
    } 
    catch (err) {
        res.status(400).json({ message: "Invalid id", error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const p = await Product.findByIdAndDelete(req.params.id);
        if (!p) 
            return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Deleted" });
    } 
    catch (err) {
        res.status(400).json({ message: "Invalid id", error: err.message });
    }
};
