import { getAppUrl } from "@notra/ai/qstash/triggers";
import { Client as QStashClient } from "@upstash/qstash";

const HOURLY_CRON = "0 * * * *";
const SCHEDULE_ID = "social-analytics-sync-hourly";

const token = process.env.QSTASH_TOKEN;
if (!token) {
  throw new Error("QSTASH_TOKEN is not configured");
}

const client = new QStashClient({ token });
const destination = `${getAppUrl()}/api/workflows/social-analytics-sync`;

const result = await client.schedules.create({
  scheduleId: SCHEDULE_ID,
  destination,
  cron: HOURLY_CRON,
  body: JSON.stringify({}),
  headers: { "Content-Type": "application/json" },
});

console.log(
  `Registered schedule ${result.scheduleId ?? SCHEDULE_ID} -> ${destination} (${HOURLY_CRON})`
);
process.exit(0);
