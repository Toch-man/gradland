import cron from "node-cron";
import User from "../models/user_model";
import Opportunity from "../models/opportunity_model";
import Notification from "../models/notification_model";
import { discover_new_opportunities } from "../ai/get_path";
import { redis } from "../lib/redis";

const CACHE_TTL_SECONDS = 26 * 60 * 60;

async function refreshAllUsers() {
  console.log("[cron] starting daily opportunity refresh");

  const activeUsers = await User.find({ goals: { $exists: true, $ne: [] } });

  for (const user of activeUsers) {
    try {
      const matches = await discover_new_opportunities(user);

      const newFinds = matches.filter(
        (m) =>
          m.source === "LIVE_SEARCH" && m.eligibility_status !== "NOT_ELIGIBLE",
      );

      for (const item of newFinds) {
        await Opportunity.create({
          title: item.title,
          type: "SCHOLARSHIP",
          description: item.program_overview || item.reasoning,
          application_url: item.application_url,
          deadline: item.deadline ? new Date(item.deadline) : null,
          is_active: true,
        });
      }

      if (newFinds.length > 0) {
        await Notification.create({
          user: user._id,
          message: `${newFinds.length} new opportunit${newFinds.length > 1 ? "ies" : "y"} found for you`,
          link: "/dashboard",
        });
      }

      await redis.set(
        `recommendations:${user._id}`,
        JSON.stringify(matches),
        "EX",
        CACHE_TTL_SECONDS,
      );

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
