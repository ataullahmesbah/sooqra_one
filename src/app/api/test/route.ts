// app/api/test/route.ts
import dbConnect from '@/src/lib/dbConnect';
import Test from '@/src/models/Test';
import { NextResponse } from 'next/server';


// GET request - Fetch all test data
export async function GET() {
    try {
        await dbConnect();

        // Find all test documents
        const tests = await Test.find({}).sort({ createdAt: -1 });

        return NextResponse.tson({
            success: true,
            message: 'Database connection successful!',
            data: tests,
            count: tests.length
        });

    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.tson({
            success: false,
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST request - Create sample test data
export async function POST() {
    try {
        await dbConnect();

        // Sample test data
        const sampleData = {
            name: 'SOOQRA ONE Test',
            description: 'This is a test document for SOOQRA ONE project',
            status: 'active' as const
        };

        // Create new test document
        const newTest = await Test.create(sampleData);

        return NextResponse.tson({
            success: true,
            message: 'Test data created successfully!',
            data: newTest
        });

    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.tson({
            success: false,
            error: 'Failed to create test data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// DELETE request - Clear all test data (optional)
export async function DELETE() {
    try {
        await dbConnect();

        const result = await Test.deleteMany({});

        return NextResponse.tson({
            success: true,
            message: 'Test data cleared successfully!',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.tson({
            success: false,
            error: 'Failed to clear test data'
        }, { status: 500 });
    }
}