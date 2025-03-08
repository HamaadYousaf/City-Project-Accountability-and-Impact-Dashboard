import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({ data: users })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const createUser = async (req, res) => {
    try {
        const { username, first_name, last_name, email, phone, password, role } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user with the hashed password
        const user = await User.create({ username, first_name, last_name, email, phone, password: hashedPassword, role });

        res.status(200).json({ data: user })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        res.status(200).json({ user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}