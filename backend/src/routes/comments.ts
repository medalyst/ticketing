
import express, { Request, Response } from 'express';

// Extend Express Request type to include user
type AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> =
  Request<P, ResBody, ReqBody, ReqQuery> & {
    user: {
      _id: string;
      username?: string;
      email?: string;
    };
  };
import Comment from '../models/Comment';
import { Ticket } from '../models/Ticket';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all comments for a ticket (chronological order)
router.get('/:ticketId', authenticate, async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate('user', 'username')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add a comment to a ticket
router.post('/:ticketId', authenticate, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const user = (req as AuthRequest).user;
    const comment = await Comment.create({
      ticket: req.params.ticketId,
      user: user._id,
      content,
    });
    await comment.populate('user', 'username');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment (only by owner)
router.delete('/:commentId', authenticate, async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const user = (req as AuthRequest).user;
    if (String(comment.user) !== String(user._id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
