import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../models/User';
import { validateAuthRequest } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateAuthRequest, async (req, res) => {
    const {username, password} = req.body;

    try {
        // Trim username for consistency
        const trimmedUsername = username.trim();
        
        const existingUser = await User.findOne({username: trimmedUsername});
        if (existingUser) {
            return res.status(400).json({message: 'Username already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({username: trimmedUsername, password: hashedPassword});

        res.status(201).json({_id: user._id, username: user.username});
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({message: 'Server error'});
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateAuthRequest, async (req, res) => {
    const {username, password} = req.body;

    try {
        // Trim username for consistency
        const trimmedUsername = username.trim();
        
        const user = await User.findOne({username: trimmedUsername});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: 'Invalid username or password'});
        }

        const token = jwt.sign(
            {userId: user._id, username: user.username},
            process.env.JWT_SECRET as string,
            {expiresIn: '24h'}
        );
        res.json({token, user: {_id: user._id, username: user.username}});

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({message: 'Server error'});
    }
});

export default router;
