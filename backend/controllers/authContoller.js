import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        const { name, email, password, role = "customer" } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        // Email format validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
            });
        }

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ message: "Email already registered" });

        const hash = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hash, role });

        return res.status(201).json({ message: "User registered successfully", user });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) 
            return res.status(401).json({ message: "User does not exist" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) 
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};