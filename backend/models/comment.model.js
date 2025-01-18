import mongoose from 'mongoose'
import { Schema } from 'mongoose';

const CommentSchema = new mongoose.Schema({
    body: { type: String, required: true },
    image:
    {
        data: Buffer,
        contentType: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    report: {
        type: Schema.Types.ObjectId,
        ref: "reports",
        required: true
    }
}, { timestamps: true });


export const Comment = mongoose.model('comments', CommentSchema);