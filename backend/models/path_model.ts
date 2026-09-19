import mongoose from "mongoose";

const Schema = mongoose.Schema;

const milestoneSchema = new Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "INTERNSHIP",
      "LEADERSHIP",
      "CERTIFICATION",
      "ACADEMIC",
      "SKILL",
      "DOCUMENT",
    ],
    required: true,
  },
  description: { type: String, required: true },
  is_required: { type: Boolean, default: true },
  weight: { type: Number, default: 1 },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date, default: null },
});

const pathSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    milestones: [milestoneSchema],
    eligibility_score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "ELIGIBLE", "APPLIED"],
      default: "IN_PROGRESS",
    },
    ai_summary: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("path", pathSchema);
