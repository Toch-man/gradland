import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./database_connection/db";
import { startOpportunityCron } from "./jobs/refresh_opportunites";
dotenv.config();

connectDB();
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
startOpportunityCron();
