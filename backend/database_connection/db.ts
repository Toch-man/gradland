import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URL!)
      .then(() => console.log("mongodb connected"));
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
