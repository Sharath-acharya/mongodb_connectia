import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// GET — fetch all students
export async function GET() {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 });
    return NextResponse.json(students);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create a student
export async function POST(req) {
  try {
    await connectDB();
    const body    = await req.json();
    const student = await Student.create(body);
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
