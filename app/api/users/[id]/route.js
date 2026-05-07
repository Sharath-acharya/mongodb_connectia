import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// GET — fetch one student
export async function GET(req, { params }) {
  try {
    await connectDB();
    const student = await Student.findById(params.id);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — update a student
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body    = await req.json();
    const student = await Student.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE — delete a student
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const student = await Student.findByIdAndDelete(params.id);
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
