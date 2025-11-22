// src/app/api/products/ipn/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';

// Interface definitions
interface IPNData {
    tran_id: string;
    status: string;
    val_id: string;
    [key: string]: any;
}

interface SSLCommerzValidationResponse {
    status: string;
    tran_id: string;
    val_id: string;
    amount: string;
    store_amount: string;
    currency: string;
    bank_tran_id: string;
    card_type: string;
    card_no: string;
    card_issuer: string;
    card_brand: string;
    card_issuer_country: string;
    card_issuer_country_code: string;
    currency_type: string;
    currency_amount: string;
    currency_rate: string;
    base_fair: string;
    value_a: string;
    value_b: string;
    value_c: string;
    value_d: string;
    risk_level: string;
    risk_title: string;
    [key: string]: any;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const data: IPNData = await request.json();

        // Validate required fields
        if (!data.tran_id || !data.status || !data.val_id) {
            return NextResponse.json({ error: 'Invalid IPN data' }, { status: 400 });
        }

        // Verify payment with SSLCOMMERZ
        const validationResponse = await axios.get<SSLCommerzValidationResponse>(
            process.env.SSLCZ_IS_SANDBOX === 'true'
                ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
                : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
            {
                params: {
                    val_id: data.val_id,
                    store_id: process.env.SSLCZ_STORE_ID,
                    store_passwd: process.env.SSLCZ_STORE_PASSWORD,
                    v: 1,
                    format: 'json',
                },
            }
        );

        // Update order status
        await Order.findOneAndUpdate(
            { orderId: data.tran_id },
            {
                status: validationResponse.data.status === 'VALID' ? 'paid' : 'failed',
                paymentDetails: validationResponse.data,
                updatedAt: new Date()
            }
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('IPN Error:', error);
        return NextResponse.json(
            { error: error.message || 'IPN processing failed' },
            { status: 500 }
        );
    }
}