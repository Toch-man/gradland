import mongoose from "mongoose";

const Schema = mongoose.Schema;

const opportunitySchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "SCHOLARSHIP",
        "INTERNSHIP",
        "JOB",
        "GRANT",
        "FELLOWSHIP",
        "ADMISSION",
      ],
      required: true,
    },
    description: { type: String, required: true },
    organization: { type: String },
    country: { type: String },

    eligibility: {
      min_grade: { type: Number },
      status: [{ type: String, enum: ["STUDENT", "GRADUATE", "NIL"] }],
      course_keywords: [{ type: String }],
      countries: [{ type: String }],
      max_age: { type: Number },
      requires_leadership: { type: Boolean, default: false },
      requires_internship: { type: Boolean, default: false },
      min_experience_months: { type: Number },
    },

    required_skills: [{ type: String }],
    required_certifications: [{ type: String }],

    deadline: { type: Date },
    application_url: { type: String },
    source_url: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Opportunity", opportunitySchema);
