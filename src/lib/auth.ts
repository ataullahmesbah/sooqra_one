import { randomBytes } from 'crypto';

export function generateToken(): string {
    return randomBytes(32).toString('hex');
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    // Add more password validation rules as needed
    return { isValid: true };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
}