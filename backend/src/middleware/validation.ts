import { Request, Response, NextFunction } from 'express';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateUsername = (username: string): ValidationResult => {
    if (!username || typeof username !== 'string') {
        return { isValid: false, error: 'Username is required' };
    }
    
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' };
    }
    
    if (trimmedUsername.length > 20) {
        return { isValid: false, error: 'Username must be less than 20 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }
    
    return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 100) {
        return { isValid: false, error: 'Password must be less than 100 characters' };
    }
    
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one letter and one number' };
    }
    
    return { isValid: true };
};

export const validateTicketTitle = (title: string): ValidationResult => {
    if (!title || typeof title !== 'string') {
        return { isValid: false, error: 'Title is required' };
    }
    
    const trimmedTitle = title.trim();
    
    if (trimmedTitle.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters long' };
    }
    
    if (trimmedTitle.length > 100) {
        return { isValid: false, error: 'Title must be less than 100 characters' };
    }
    
    return { isValid: true };
};

export const validateTicketDescription = (description: string): ValidationResult => {
    if (description && typeof description === 'string' && description.length > 1000) {
        return { isValid: false, error: 'Description must be less than 1000 characters' };
    }
    
    return { isValid: true };
};

export const validateComment = (content: string): ValidationResult => {
    if (!content || typeof content !== 'string') {
        return { isValid: false, error: 'Comment content is required' };
    }
    
    const trimmedContent = content.trim();
    
    if (trimmedContent.length === 0) {
        return { isValid: false, error: 'Comment cannot be empty' };
    }
    
    if (trimmedContent.length > 500) {
        return { isValid: false, error: 'Comment must be less than 500 characters' };
    }
    
    return { isValid: true };
};

export const validateTicketStatus = (status: string): ValidationResult => {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    
    if (status && !validStatuses.includes(status)) {
        return { isValid: false, error: 'Status must be OPEN, IN_PROGRESS, or CLOSED' };
    }
    
    return { isValid: true };
};

// Middleware to validate auth requests
export const validateAuthRequest = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        return res.status(400).json({ message: usernameValidation.error });
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return res.status(400).json({ message: passwordValidation.error });
    }
    
    next();
};

// Middleware to validate ticket requests
export const validateTicketRequest = (req: Request, res: Response, next: NextFunction) => {
    const { title, description, status } = req.body;
    
    const titleValidation = validateTicketTitle(title);
    if (!titleValidation.isValid) {
        return res.status(400).json({ message: titleValidation.error });
    }
    
    const descriptionValidation = validateTicketDescription(description);
    if (!descriptionValidation.isValid) {
        return res.status(400).json({ message: descriptionValidation.error });
    }
    
    const statusValidation = validateTicketStatus(status);
    if (!statusValidation.isValid) {
        return res.status(400).json({ message: statusValidation.error });
    }
    
    next();
};

// Middleware to validate comment requests
export const validateCommentRequest = (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body;
    
    const contentValidation = validateComment(content);
    if (!contentValidation.isValid) {
        return res.status(400).json({ message: contentValidation.error });
    }
    
    next();
};