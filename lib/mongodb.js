import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw at build time — only fail at runtime when actually called


// Cache connection across hot reloads in dev
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in environment variables");
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
