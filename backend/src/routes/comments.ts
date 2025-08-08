import express from 'express';
import {Comment} from '../models/Comment';
import {Ticket} from '../models/Ticket';
import {authenticate} from '../middleware/auth';
import { validateCommentRequest } from '../middleware/validation';

interface AuthRequest extends express.Request {
    userId?: string;
    username?: string;
}

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /comments/ticket/{ticketId}:
 *   get:
 *     summary: Get all comments for a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: List of comments for the ticket
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ticket/:ticketId', async (req: AuthRequest, res) => {
    try {
        const {ticketId} = req.params;

        // Verify that the ticket exists
        const ticket = await Ticket.findOne({
            _id: ticketId,
        });

        if (!ticket) {
            return res.status(404).json({message: 'Ticket not found'});
        }

        // Get comments in chronological order (oldest first)
        const comments = await Comment.find({ticketId}).sort({createdAt: 1});

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({message: 'Server error'});
    }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment for a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Ticket not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateCommentRequest, async (req: AuthRequest, res) => {
    try {
        const {content, ticketId} = req.body;

        if (!ticketId) {
            return res.status(400).json({message: 'Ticket ID is required'});
        }

        // Verify that the ticket exists and belongs to the user
        const ticket = await Ticket.findOne({
            _id: ticketId,
        });

        if (!ticket) {
            return res.status(404).json({message: 'Ticket not found'});
        }

        const comment = await Comment.create({
            content: content.trim(),
            ticketId,
            userId: req.userId,
            username: req.username,
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({message: 'Server error'});
    }
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (only own comments)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment deleted
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - can only delete own comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!comment) {
            return res.status(404).json({message: 'Comment not found or unauthorized'});
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.json({message: 'Comment deleted'});
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({message: 'Server error'});
    }
});

export default router;