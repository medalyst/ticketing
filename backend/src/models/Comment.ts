import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true }, // Include username to avoid database lookups
    },
    { timestamps: true }
);

commentSchema.index({ ticketId: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);