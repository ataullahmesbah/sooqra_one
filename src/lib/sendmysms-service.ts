import axios from 'axios';

interface SendMySMSParams {
    phone: string;
    message: string;
    senderId?: string;
}

export async function sendViaSendMySMS({ phone, message, senderId }: SendMySMSParams) {
    const apiKey = process.env.NEXT_PUBLIC_SENDMYSMS_API_KEY;
    const defaultSenderId = process.env.NEXT_PUBLIC_SENDMYSMS_SENDER_ID || 'SOOQRA';
    const apiUrl = process.env.NEXT_PUBLIC_SENDMYSMS_API_URL || 'https://sendmysms.net/api';

    if (!apiKey) {
        throw new Error('SendMySMS API key not configured');
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 11 && formattedPhone.startsWith('01')) {
        formattedPhone = `880${formattedPhone.slice(1)}`;
    }

    // Prepare request data based on SendMySMS API documentation
    const requestData = {
        api_key: apiKey,
        sender_id: senderId || defaultSenderId,
        message: message,
        to: formattedPhone,
        // Add other parameters as needed
        type: 'text', // or 'unicode' for Bangla
        datetime: new Date().toISOString(),
    };

    try {
        const response = await axios.post(apiUrl, requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return {
            success: response.data.success || response.data.status === 'success',
            data: response.data,
            message: response.data.message || 'SMS sent via SendMySMS',
        };
    } catch (error: any) {
        console.error('SendMySMS error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
            message: 'Failed to send SMS via SendMySMS',
        };
    }
}

// OTP-specific function
export async function sendOTPViaSendMySMS(phone: string, otp: string) {
    const senderId = process.env.NEXT_PUBLIC_SENDMYSMS_SENDER_ID || 'SOOQRA';
    const message = `Your OTP is: ${otp}. Valid for 2 minutes. - ${senderId}`;

    return sendViaSendMySMS({
        phone,
        message,
        senderId,
    });
}