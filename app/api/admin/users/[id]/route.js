import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    const adminUser = token ? await verifyToken(token) : null;
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }
    if (id === adminUser.userId) {
      return NextResponse.json({ message: "You cannot modify your own admin account" }, { status: 400 });
    }

    const body = await request.json();
    const { isActive, role } = body;
    const updates = {};

    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return NextResponse.json({ message: "Invalid role value" }, { status: 400 });
      }
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select("-password");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
