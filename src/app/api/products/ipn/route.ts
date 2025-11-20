import { NextResponse } from 'next/server';
import Order from '@/src/models/Order';
import axios from 'axios';
import dbConnect from '@/src/lib/dbConnect';


export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.tson();

        // Validate required fields
        if (!data.tran_id || !data.status || !data.val_id) {
            return NextResponse.tson({ error: 'Invalid IPN data' }, { status: 400 });
        }

        // Verify payment with SSLCOMMERZ
        const validationResponse = await axios.get(
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

        return NextResponse.tson({ success: true }, { status: 200 });
    } catch (error) {
        console.error('IPN Error:', error);
        return NextResponse.tson(
            { error: error.message || 'IPN processing failed' },
            { status: 500 }
        );
    }
}