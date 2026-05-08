import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import User from "@/models/User";

export async function GET(request) {
  try {

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
