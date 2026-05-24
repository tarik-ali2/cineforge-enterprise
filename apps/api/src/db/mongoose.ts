import mongoose from 'mongoose';
import { env } from '../config/env.js';

let connection: typeof mongoose | null = null;

export async function connectDb() {
  if (connection) return connection;
  mongoose.set('strictQuery', true);
  connection = await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000
  });
  return connection;
}

