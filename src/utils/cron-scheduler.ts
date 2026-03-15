import cron from "node-cron";
import dotenv from "dotenv";
import { getAppBaseUrl } from "../lib/app-url";

// Load environment variables
dotenv.config();

const APP_URL = getAppBaseUrl();

async function triggerEscrowRelease() {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 🔄 Running escrow release cron...`);

    try {
        const CRON_SECRET = process.env.CRON_SECRET;

        if (!CRON_SECRET) {
            console.error("❌ CRON_SECRET not found in environment variables");
            process.exit(1);
        }
        const response = await fetch(`${APP_URL}/api/marketplace/cron/escrow-release`, {

            method: "POST",
            headers: {
                "x-cron-secret": CRON_SECRET,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Escrow release failed:`, data);
            return;
        }

        console.log(`✅ Escrow release completed:`);
        console.log(`   - Total due orders: ${data.totalDueOrders}`);
        console.log(`   - Released businesses: ${data.releasedBusinesses}`);
        console.log(`   - Released orders: ${data.releasedOrders}`);
        console.log(`   - Failed businesses: ${data.failedBusinesses}`);

        if (data.failures && data.failures.length > 0) {
            console.log(`\n⚠️  Failures:`);
            data.failures.forEach((failure: { businessId: string; reason: string }) => {
                console.log(`   - Business ${failure.businessId}: ${failure.reason}`);
            });
        }
    } catch (error) {
        console.error(`❌ Error triggering escrow release:`, error);
    }
}

// Schedule the cron job to run every 5 minutes
const cronExpression = "*/1 * * * *"; // Every 5 minutes
console.log(`🚀 Escrow release scheduler started`);
console.log(`📅 Schedule: Every 5 minutes (${cronExpression})`);
console.log(`🌐 Target URL: ${APP_URL}/api/marketplace/cron/escrow-release`);
console.log(`⏰ Next run will be in ~5 minutes\n`);

cron.schedule(cronExpression, triggerEscrowRelease, {
    timezone: "Africa/Lagos", // Adjust to your timezone
});

// Optional: Run immediately on startup for testing
if (process.env.RUN_ON_STARTUP === "true") {
    console.log("🏃 Running immediately on startup...");
    triggerEscrowRelease();
}

// Keep the process running
process.on("SIGINT", () => {
    console.log("\n👋 Shutting down scheduler...");
    process.exit(0);
});

console.log("✨ Scheduler is running. Press Ctrl+C to stop.\n");
