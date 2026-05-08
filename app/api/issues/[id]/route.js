import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Issue from "@/models/Issue";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid issue ID" }, { status: 400 });
    }

    await connectDB();
    const issue = await Issue.findById(id).lean();
    if (!issue) return NextResponse.json({ message: "Issue not found" }, { status: 404 });

    if (user.role !== "admin" && issue.userId.toString() !== user.userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid issue ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, adminNote } = body;

    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status value" }, { status: 400 });
    }
    if (adminNote && adminNote.length > 500) {
      return NextResponse.json({ message: "Admin note must be under 500 characters" }, { status: 400 });
    }

    await connectDB();
    const updates = {};
    if (status) updates.status = status;
    if (adminNote !== undefined) updates.adminNote = adminNote.trim().replace(/[<>]/g, "");

    const issue = await Issue.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!issue) return NextResponse.json({ message: "Issue not found" }, { status: 404 });

    return NextResponse.json({ message: "Issue updated successfully", issue });
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    const user = token ? await verifyToken(token) : null;
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid issue ID" }, { status: 400 });
    }

    await connectDB();
    const issue = await Issue.findById(id);
    if (!issue) return NextResponse.json({ message: "Issue not found" }, { status: 404 });

    const isOwner = issue.userId.toString() === user.userId;
    if (!isOwner && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Issue.findByIdAndDelete(id);
    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
