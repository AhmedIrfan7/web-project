import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { validatePassword } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token?.trim()) {
      return NextResponse.json({ message: "Reset token is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "New password is required" }, { status: 400 });
    }

    const pwError = validatePassword(password);
    if (pwError) {
      return NextResponse.json({ message: pwError }, { status: 400 });
    }

    await connectDB();

    const record = await PasswordReset.findOne({
      token: token.trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: record.email }).select("+password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.password = password;
    await user.save();

    record.used = true;
    await record.save();

    await PasswordReset.deleteMany({ email: record.email });

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
