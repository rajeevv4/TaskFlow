// import { number, string } from "joi";
import mongoose from "mongoose";

const project = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        unique: true // `email` must be unique
    },
    description: String,
    task: [
        {
            id: Number,
            title: String,
            description: String,
            order: Number,
            stage: String,
            index: Number,
            attachment: [
                { type: String, url: String }
            ],
            priority: {
                type: String,
                enum: ['Low', 'Medium', 'High'],
                default: 'Medium'
            },
            dueDate: {
                type: Date
            },
            created_at: { type: Date, default: Date.now },
            updated_at: { type: Date, default: Date.now },
        }
    ]
}, { timestamps: true })


export default mongoose.model('Project', project);