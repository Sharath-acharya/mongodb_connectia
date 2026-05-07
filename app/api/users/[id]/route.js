import { NextResponse } from "next/server";
import { getById, update, remove } from "../store";

export async function GET(req, { params }) {
  const student = getById(params.id);
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req, { params }) {
  try {
    const body    = await req.json();
    const student = update(params.id, { ...body, age: Number(body.age) || null });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const student = remove(params.id);
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted successfully" });
}
