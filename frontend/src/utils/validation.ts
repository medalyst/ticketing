export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateUsername = (username: string): ValidationResult => {
    if (!username.trim()) {
        return { isValid: false, error: 'Username is required' };
    }
    
    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' };
    }
    
    if (username.length > 20) {
        return { isValid: false, error: 'Username must be less than 20 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }
    
    return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
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

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword) {
        return { isValid: false, error: 'Password confirmation is required' };
    }
    
    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }
    
    return { isValid: true };
};

export const validateTicketTitle = (title: string): ValidationResult => {
    if (!title.trim()) {
        return { isValid: false, error: 'Title is required' };
    }
    
    if (title.length < 3) {
        return { isValid: false, error: 'Title must be at least 3 characters long' };
    }
    
    if (title.length > 100) {
        return { isValid: false, error: 'Title must be less than 100 characters' };
    }
    
    return { isValid: true };
};

export const validateTicketDescription = (description: string): ValidationResult => {
    if (description && description.length > 1000) {
        return { isValid: false, error: 'Description must be less than 1000 characters' };
    }
    
    return { isValid: true };
};

export const validateComment = (content: string): ValidationResult => {
    if (!content.trim()) {
        return { isValid: false, error: 'Comment cannot be empty' };
    }
    
    if (content.length > 500) {
        return { isValid: false, error: 'Comment must be less than 500 characters' };
    }
    
    return { isValid: true };
};