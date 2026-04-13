import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FitSubmission from "@/models/FitSubmission";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    const doc = await FitSubmission.create(body);
    return NextResponse.json({ success: true, id: doc._id });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
