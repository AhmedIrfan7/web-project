import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const issues = await Issue.find({})
      .select("title category status location createdAt")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Map issues error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
