import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        const { name, email, password, role = "customer" } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password required" });

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: "Email already registered" });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, role });

        return res.status(201).json({ message: "Registered", user: { id: user._id, email: user.email, role: user.role } });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User does not exist" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// To get user detail for profile
export const me = async (req, res) => {
  res.json({ user: req.user });
};