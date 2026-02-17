// lib/dbConnect.ts
import mongoose from 'mongoose';
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1', '8.8.8.8']);

// Interface for cached connection
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend global namespace for mongoose cache
declare global {
    var mongoose: MongooseCache | undefined;
}

// Get environment variables with type assertion after validation
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Validate environment variables
if (!MONGODB_URI) {
    throw new Error('❌ Please define MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
    throw new Error('❌ Please define MONGODB_DB environment variable inside .env.local');
}

// Now we can safely assert these are strings
const MONGODB_URI_STRING = MONGODB_URI as string;
const MONGODB_DB_STRING = MONGODB_DB as string;

// Initialize cached connection with const
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Database connection function with caching
 * @returns {Promise<typeof mongoose>} Mongoose connection
 */
async function dbConnect(): Promise<typeof mongoose> {
    // Return cached connection if exists
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    // Create new connection promise if not exists
    if (!cached.promise) {
        const connectionOptions = {
            dbName: MONGODB_DB_STRING,
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } as mongoose.ConnectOptions;

        console.log('🔄 Creating new MongoDB connection...');

        cached.promise = mongoose.connect(MONGODB_URI_STRING, connectionOptions)
            .then((mongooseInstance) => {
                console.log('✅ MongoDB Connected Successfully');
                return mongooseInstance;
            })
            .catch((error) => {
                console.error('❌ MongoDB Connection Failed:', error);
                cached.promise = null; // Reset promise on failure
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        console.error('❌ Failed to establish MongoDB connection:', error);
        cached.promise = null;
        throw new Error(`Database connection failed: ${error}`);
    }

    return cached.conn;
}

// Export the function
export default dbConnect;