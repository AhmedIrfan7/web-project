import mongoose, { Schema } from "mongoose";

const IssueSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title must be under 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [1000, "Description must be under 1000 characters"],
    },
    category: {
      type: String,
      enum: ["Road", "Water", "Electricity", "Garbage", "Park", "Other"],
      required: [true, "Category is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    location: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
      address: { type: String, default: "", trim: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true },
    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Admin note must be under 500 characters"],
    },
  },
  { timestamps: true }
);

IssueSchema.index({ userId: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ createdAt: -1 });

const Issue = mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
export default Issue;
