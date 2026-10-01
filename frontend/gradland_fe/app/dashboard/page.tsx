import { redirect } from "next/navigation";

// /dashboard itself has no content of its own — it's just the address
// someone lands on right after login, and immediately forwards to Profile.
export default function DashboardIndex() {
  redirect("/dashboard/profile");
}
