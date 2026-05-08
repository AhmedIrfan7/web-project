import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { generateResetToken } from "@/lib/jwt";
import { sendPasswordResetEmail } from "@/lib/email";
import { validateEmail } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    const successMsg = {
      message: "If an account exists with this email, you will receive a reset link shortly.",
    };

    if (!user) return NextResponse.json(successMsg);

    await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordReset.create({ email: email.toLowerCase().trim(), token, expiresAt });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    return NextResponse.json(successMsg);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
