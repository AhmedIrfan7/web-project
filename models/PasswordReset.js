import mongoose, { Schema } from "mongoose";

const PasswordResetSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model("PasswordReset", PasswordResetSchema);
export default PasswordReset;
