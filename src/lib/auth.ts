// src/lib/auth.ts

import { randomBytes } from 'crypto';

export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
    // Minimum length 8
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character (@, #, $, etc.)' };
    }

    return { isValid: true };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
}