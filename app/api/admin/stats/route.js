import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const [total, pending, inProgress, resolved, totalUsers, activeUsers, categoryStats] =
      await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: "Pending" }),
        Issue.countDocuments({ status: "In Progress" }),
        Issue.countDocuments({ status: "Resolved" }),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "user", isActive: true }),
        Issue.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

    return NextResponse.json({
      stats: { totalIssues: total, pendingIssues: pending, inProgressIssues: inProgress, resolvedIssues: resolved, totalUsers, activeUsers, categoryStats },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
