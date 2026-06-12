import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
