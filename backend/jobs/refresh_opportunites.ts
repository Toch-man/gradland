import cron from "node-cron";
import User from "../models/user_model";
import { fetch_opportunities } from "../ai/get_path";
import Opportunity from "../models/opportunity_model";

async function refreshAllUsers() {
  console.log("[cron] starting daily opportunity refresh");

  const activeUsers = await User.find({ goals: { $exists: true, $ne: [] } });

  for (const user of activeUsers) {
    try {
      const matches = await fetch_opportunities(user);

      const newFinds = matches.filter(
        (m) =>
          m.source === "LIVE_SEARCH" && m.eligibility_status !== "NOT_ELIGIBLE",
      );

      for (const item of newFinds) {
        await Opportunity.create({
          title: item.title,
          type: "SCHOLARSHIP", // refine later based on which goal matched
          description: item.reasoning,
          application_url: item.application_url,
          deadline: item.deadline ? new Date(item.deadline) : null,
          is_active: true,
        });
      }

      console.log(
        `[cron] refreshed ${user.email}: ${newFinds.length} new opportunities saved`,
      );
    } catch (err) {
      console.error(`[cron] failed for ${user.email}`, err);
    }
  }

  console.log("[cron] daily refresh complete");
}

export function startOpportunityCron() {
  cron.schedule("0 6 * * *", refreshAllUsers);
  console.log("[cron] opportunity refresh job scheduled for 6:00 AM daily");
}
