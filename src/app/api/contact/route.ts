import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

// Function to escape HTML special characters
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, phone, message, subject = 'General Inquiry' } = body;

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'message'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    missingFields
                },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Escape user inputs to prevent HTML injection
        const safeFirstName = escapeHtml(firstName);
        const safeLastName = escapeHtml(lastName);
        const safeEmail = escapeHtml(email);
        const safePhone = escapeHtml(phone);
        const safeMessage = escapeHtml(message);
        const safeSubject = escapeHtml(subject);

        // Format current date
        const currentDate = new Date().toLocaleString('en-BD', {
            timeZone: 'Asia/Dhaka',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Send email to Sooqra One support
        const { data, error } = await resend.emails.send({
            from: 'Team Contact <onboarding@resend.dev>',
            to: ['ataullah.mesbah486@gmail.com'],
            // from: 'Sooqra One Support <support@sooqraone.com>',
            // to: ['support@sooqraone.com'], // Your Sooqra One support email
            replyTo: safeEmail,
            subject: `[${safeSubject}] New Contact Form Submission - ${safeFirstName} ${safeLastName}`,
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - Sooqra One</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 12px 12px 0 0;">
                <table width="100%">
                  <tr>
                    <td style="text-align: center;">
                      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                        🛒 Sooqra One Contact Form
                      </h1>
                      <p style="color: #d1d5db; margin: 0; font-size: 16px; font-weight: 400;">
                        New customer inquiry received
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding: 40px 30px; background-color: #ffffff; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
                <!-- Subject Badge -->
                <div style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 30px;">
                  📋 ${safeSubject}
                </div>
                
                <!-- Customer Info -->
                <div style="margin-bottom: 30px;">
                  <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
                    Customer Information
                  </h2>
                  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: separate; border-spacing: 0 12px;">
                    <tr>
                      <td width="40%" style="color: #6b7280; font-size: 14px; font-weight: 500; padding-right: 20px;">
                        👤 Name
                      </td>
                      <td style="color: #111827; font-size: 16px; font-weight: 600;">
                        ${safeFirstName} ${safeLastName}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; font-weight: 500; padding-right: 20px;">
                        📧 Email
                      </td>
                      <td>
                        <a href="mailto:${safeEmail}" style="color: #2563eb; font-size: 16px; font-weight: 500; text-decoration: none;">
                          ${safeEmail}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; font-weight: 500; padding-right: 20px;">
                        📞 Phone
                      </td>
                      <td style="color: #111827; font-size: 16px; font-weight: 500;">
                        ${safePhone}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; font-size: 14px; font-weight: 500; padding-right: 20px; vertical-align: top;">
                        📅 Submitted
                      </td>
                      <td style="color: #6b7280; font-size: 14px; font-weight: 400;">
                        ${currentDate}
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- Message -->
                <div>
                  <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
                    📝 Customer Message
                  </h2>
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-wrap;">
                      ${safeMessage}
                    </p>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="mailto:${safeEmail}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                          📧 Reply via Email
                        </a>
                        <a href="tel:${safePhone.replace(/[^\d+]/g, '')}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          📞 Call Customer
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  This email was sent from your Sooqra One contact form.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Sooqra One. All rights reserved.<br>
                  <a href="https://sooqraone.com" style="color: #6b7280; text-decoration: none;">sooqraone.com</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
            text: `
New Contact Form Submission - Sooqra One

Subject: ${safeSubject}
Customer: ${safeFirstName} ${safeLastName}
Email: ${safeEmail}
Phone: ${safePhone}
Submitted: ${currentDate}

Message:
${safeMessage}

Please respond to the customer within the next 24 hours.
      `
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }

        // Also send auto-reply to customer
        await resend.emails.send({
            from: 'Sooqra One Support <noreply@sooqraone.com>',
            to: [safeEmail],
            subject: 'Thank You for Contacting Sooqra One!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sooqra One Support</h1>
            </div>
            <div class="content">
              <h2>Thank You for Contacting Us!</h2>
              <p>Hello ${safeFirstName},</p>
              <p>We have received your message and our support team will get back to you within 24 hours.</p>
              <p><strong>Your Inquiry:</strong> ${safeSubject}</p>
              <p>If you need immediate assistance, please call us at: <strong>+880 1571-083401</strong></p>
              <p>Best regards,<br>The Sooqra One Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Sooqra One. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
        });

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            data: data
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process contact form',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}