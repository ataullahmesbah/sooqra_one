// src/lib/sms-utils.ts

export interface SMSResponse {
  success: boolean;
  message: string;
  smsId?: string;
  error?: string;
}

export interface SMSParams {
  phone: string;
  message: string;
}

/**
 * Format phone to international format (880...)
 */
export function formatPhoneForSMS(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `880${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('880') && cleaned.length === 13) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `880${cleaned}`;
  }
  return cleaned;
}

/**
 * Validate Bangladeshi phone number
 */
/**
 * Validate Bangladeshi phone number
 */
export function isValidBangladeshiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(01[3-9]\d{8})$/.test(cleaned) || /^8801[3-9]\d{8}$/.test(cleaned);
}

/**
 * Send SMS via SendMySMS api.php (Production Optimized)
 */
export async function sendSMSviaSendMySMS(params: SMSParams): Promise<SMSResponse> {
  const { phone, message } = params;

  const username = process.env.SENDMYSMS_USERNAME;
  const apiKey = process.env.SENDMYSMS_API_KEY;
  
  if (!username || !apiKey) {
    return {
      success: false,
      message: 'SMS configuration missing',
      error: 'CONFIG_ERROR'
    };
  }

  const to = formatPhoneForSMS(phone);
  const apiUrl = process.env.SENDMYSMS_API_URL || 'https://sendmysms.net/api.php';

  try {
    const formData = new URLSearchParams({
      user: username,
      key: apiKey,
      to,
      msg: message
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'SMS gateway error',
        error: `HTTP_${response.status}`
      };
    }

    const data = await response.json();

    if (data.status === 'OK' || data.response?.includes('successfully')) {
      return {
        success: true,
        message: 'SMS sent successfully',
        smsId: data.id || data.message_id
      };
    }

    return {
      success: false,
      message: data.response || 'Failed to send SMS',
      error: data.error || 'GATEWAY_REJECTED'
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to connect to SMS gateway',
      error: error.message || 'NETWORK_ERROR'
    };
  }
}

/**
 * Send OTP SMS
 */
export async function sendOTPSMS(phone: string, otp: string): Promise<SMSResponse> {
  const message = `Your verification code is ${otp}. Valid for 2 minutes. Do not share with anyone. - SOOQRA`;
  
  return await sendSMSviaSendMySMS({ phone, message });
}