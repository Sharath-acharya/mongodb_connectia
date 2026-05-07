import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// GET all users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create user
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const user = await User.create(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("POST /api/users error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
