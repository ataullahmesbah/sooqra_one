// Generate OTP
export function generateOTP(length: number = 5): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
        return `880${cleaned.slice(1)}`;
    }
    return cleaned;
}

// Check if phone is valid Bangladeshi number
export function isValidBangladeshiPhone(phone: string): boolean {
    const regex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    return regex.test(phone);
}