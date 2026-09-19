import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    status: {
      type: String,
      enum: ["STUDENT", "GRADUATE", "NIL"],
      required: true,
    },
    school: { type: String },
    course_of_study: { type: String },
    grade: { type: Number },
    current_grade: { type: Number },
    skill: [{ type: String }],
    goals: [
      {
        type: String,
        enum: [
          "SCHOLARSHIP",
          "INTERNSHIP",
          "JOB",
          "GRADUATE_SCHOOL",
          "ADMISSION_ABROAD",
        ],
      },
    ],
    preferred_countries: [{ type: String }],
    work_experience: [
      {
        title: { type: String },
        organization: { type: String },
        duration_months: { type: Number },
      },
    ],
    leadership_experience: [
      {
        title: { type: String },
        organization: { type: String },
        description: { type: String },
      },
    ],
    certifications: [{ type: String }],

    paths: [{ type: Schema.Types.ObjectId, ref: "path" }],
    token: { type: String, required: true, default: null },
    token_expires: { type: Date, required: true, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
