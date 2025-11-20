// api/products/slug[slug]/route.ts

import dbConnect from '@/lib/dbMongoose';
import Product from '@/models/Products';


export async function GET(request, { params }) {
    await dbConnect();
    try {
        const product = await Product.findOne({ slug: params.slug })
            .populate('category')
            .lean();
        if (!product) {
            return Response.tson({ error: 'Product not found' }, { status: 404 });
        }
        return Response.tson(product, { status: 200 });
    } catch (error) {
        console.error('Error fetching product:', error);
        return Response.tson({ error: `Failed to fetch product: ${error.message}` }, { status: 500 });
    }
}