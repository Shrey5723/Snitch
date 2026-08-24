import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

export default connectDB;