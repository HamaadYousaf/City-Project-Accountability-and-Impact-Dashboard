import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin'] }
}, { timestamps: true });


export const User = mongoose.model('users', UserSchema);