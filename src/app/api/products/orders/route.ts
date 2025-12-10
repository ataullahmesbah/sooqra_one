// src/app/api/products/orders/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import Order from '@/src/models/Order';
import Products from '@/src/models/Products';
import Config from '@/src/models/Config';
import UsedCoupon from '@/src/models/UsedCoupon';
import Coupon from '@/src/models/Coupon';

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    district?: string;
    thana?: string;
    notes?: string;
    bkashNumber?: string;
    transactionId?: string;

}

interface ProductItem {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    mainImage?: string;
    size?: string;
}

interface CreateOrderRequestBody {
    orderId: string;
    products: ProductItem[];
    customerInfo: CustomerInfo;
    paymentMethod: string;
    status: string;
    total: number;
    discount?: number;
    shippingCharge?: number;
    couponCode?: string | null;
    userId?: string | null;
    userEmail?: string;
    userPhone?: string;
}





export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const status = searchParams.get('status');
        const date = searchParams.get('date');

        const query: any = {};
        if (orderId) {
            query.orderId = orderId;
        }
        if (status) {
            query.status = { $in: status.split(',') };
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }

        const orders = await Order.find(query).lean();
        return NextResponse.json(orders, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to fetch orders: ${error.message}` }, { status: 500 });
    }
}






export async function POST(request: Request) {
    try {
        await dbConnect();

        const {
            orderId,
            products,
            customerInfo,
            paymentMethod,
            status,
            total,
            discount = 0,
            shippingCharge = 0,
            couponCode = null,
            userId = null,
            userEmail,
            userPhone,
        }: CreateOrderRequestBody = await request.json();

        // 1. Required fields validation
        if (!orderId || !products?.length || !customerInfo || !paymentMethod || !status || total == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
            return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 });
        }

        // 2. Bkash validation
        if (paymentMethod === 'bkash') {
            if (!customerInfo.bkashNumber || !customerInfo.transactionId) {
                return NextResponse.json({ error: 'Bkash number and Transaction ID required' }, { status: 400 });
            }
            if (customerInfo.bkashNumber.length !== 11) {
                return NextResponse.json({ error: 'Invalid Bkash number. Must be 11 digits.' }, { status: 400 });
            }
        }

        // 3. COD & Bkash: District + Thana required
        if ((paymentMethod === 'cod' || paymentMethod === 'bkash') && customerInfo.country === 'Bangladesh') {
            if (!customerInfo.district || !customerInfo.thana) {
                return NextResponse.json({ error: 'District and thana required for delivery' }, { status: 400 });
            }
        }

        // 4. Product validation (only check, don't reduce stock)
        for (const item of products) {
            const product = await Products.findById(item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.title}` }, { status: 400 });
            }

            if (product.availability !== 'InStock') {
                return NextResponse.json({ error: `${item.title} is out of stock` }, { status: 400 });
            }

            if (product.sizeRequirement === 'Mandatory' && !item.size) {
                return NextResponse.json({ error: `Size required for ${item.title}` }, { status: 400 });
            }

            if (item.size && product.sizeRequirement === 'Mandatory') {
                const sizeData = product.sizes.find((s: any) => s.name === item.size);
                if (!sizeData || sizeData.quantity < item.quantity) {
                    return NextResponse.json({ error: `Not enough stock for ${item.title} (Size: ${item.size})` }, { status: 400 });
                }
            } else if (product.quantity < item.quantity) {
                return NextResponse.json({ error: `Only ${product.quantity} units available for ${item.title}` }, { status: 400 });
            }
        }

        // 5. Coupon validation (product & global)
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (coupon) {
                // Product-specific coupon
                if (!products.some(p => p.productId === coupon.productId?.toString())) {
                    return NextResponse.json({ error: 'Coupon not applicable to cart items' }, { status: 400 });
                }
                if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                    return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
                }
                if (coupon.useType === 'one-time') {
                    const used = await UsedCoupon.findOne({
                        couponCode,
                        $or: [{ email: customerInfo.email }, { phone: customerInfo.phone }]
                    });
                    if (used) return NextResponse.json({ error: 'Coupon already used' }, { status: 400 });
                }
            } else {
                // Global coupon
                const globalCoupon = await Config.findOne({
                    key: 'globalCoupon',
                    'value.code': { $regex: `^${couponCode}$`, $options: 'i' }
                });
                if (!globalCoupon?.value?.code) {
                    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
                }
                const { discountAmount, minCartTotal, expiresAt } = globalCoupon.value;
                const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
                if (subtotal < (minCartTotal || 0)) {
                    return NextResponse.json({ error: `Minimum ৳${minCartTotal} required` }, { status: 400 });
                }
                if (expiresAt && new Date(expiresAt) < new Date()) {
                    return NextResponse.json({ error: 'Coupon expired' }, { status: 400 });
                }
                if (discount !== discountAmount) {
                    return NextResponse.json({ error: 'Invalid discount amount' }, { status: 400 });
                }
            }
        }


        // 6. Create order — STOCK NOT REDUCED HERE
        const order = await Order.create({
            orderId,
            userId: userId || null,
            userEmail: userEmail || customerInfo.email,
            userPhone: userPhone || customerInfo.phone,
            products: products.map(p => ({
                productId: p.productId,
                title: p.title,
                quantity: p.quantity,
                price: p.price,
                mainImage: p.mainImage || null,
                size: p.size || null
            })),
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                notes: customerInfo.notes || '', // ✅ notes সঠিকভাবে যোগ করা হয়েছে
                city: customerInfo.city || '',
                postcode: customerInfo.postcode || '',
                country: customerInfo.country || 'Bangladesh', // ✅ country যোগ করা হয়েছে
                district: customerInfo.district || '',
                thana: customerInfo.thana || '',
                bkashNumber: customerInfo.bkashNumber || '',
                transactionId: customerInfo.transactionId || ''
            },
            paymentMethod,
            status: paymentMethod === 'bkash' ? 'pending_payment' : 'pending',
            total,
            discount,
            shippingCharge,
            couponCode,
        });

        // 7. Record coupon usage
        if (couponCode) {
            await UsedCoupon.create({
                couponCode,
                email: customerInfo.email,
                phone: customerInfo.phone,
                userId: userId || null,
                usedAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Order created successfully',
            orderId: order.orderId,
            order,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}

