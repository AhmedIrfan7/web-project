import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { validateIssue, sanitizeString } from "@/lib/validation";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const filter = {};
    const validStatuses = ["Pending", "In Progress", "Resolved"];
    const validCats = ["Road", "Water", "Electricity", "Garbage", "Park", "Other"];
    if (status && validStatuses.includes(status)) filter.status = status;
    if (category && validCats.includes(category)) filter.category = category;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ issues, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Get issues error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, category, location } = body;

    const validation = validateIssue({ title, description, category, location });
    if (!validation.valid) {
      return NextResponse.json({ message: "Validation failed", errors: validation.errors }, { status: 400 });
    }

    await connectDB();
    const dbUser = await User.findById(user.userId);
    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json({ message: "Account not found or deactivated" }, { status: 403 });
    }

    const issue = await Issue.create({
      title: sanitizeString(title),
      description: sanitizeString(description),
      category,
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
        address: sanitizeString(location.address || ""),
      },
      userId: user.userId,
      userName: dbUser.name,
      userEmail: dbUser.email,
    });

    return NextResponse.json({ message: "Issue reported successfully", issue }, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
