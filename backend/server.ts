import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./database_connection/db";
import { startOpportunityCron } from "./jobs/refresh_opportunites";
dotenv.config();

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
startOpportunityCron();
