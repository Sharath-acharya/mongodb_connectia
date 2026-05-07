import { NextResponse } from "next/server";
import { getAll, create } from "./store";

export async function GET() {
  return NextResponse.json(getAll());
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    const student = create({ ...body, age: Number(body.age) || null });
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
