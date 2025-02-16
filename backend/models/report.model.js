import mongoose from 'mongoose'
import { Schema } from 'mongoose';

const ReportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'], // GeoJSON format for geolocation
            required: true,
        },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    image: {
        type: String,
        default: null, // Stores image URL
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "projects",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, { timestamps: true });


export const Report = mongoose.model('reports', ReportSchema);