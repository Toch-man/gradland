import mongoose from "mongoose";
import { calculateAge } from "../jobs/calculate_age";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("age").get(function (this: any) {
  return calculateAge(this.date_of_birth);
});
export default mongoose.model("User", userSchema);
