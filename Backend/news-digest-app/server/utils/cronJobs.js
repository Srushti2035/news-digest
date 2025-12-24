const cron = require('node-cron');
const User = require('../models/User');
const { generateDigest } = require('../services/digestService');

const runScheduledCheck = async (forceHour = null) => {
    const currentHour = forceHour !== null ? forceHour : new Date().getHours();
    const hourString = String(currentHour).padStart(2, '0');
    console.log(`Running scheduled check for hour: ${hourString}:00`);

    const users = await User.find({ isSubscribed: true });

    for (const user of users) {
        // If user has a custom schedule, check if it matches current hour
        if (user.scheduleType === 'custom' && user.customScheduleTimes && user.customScheduleTimes.length > 0) {
            if (!user.customScheduleTimes.includes(hourString)) {
                continue; // Skip if it's not their time
            }
        }

        console.log(`Sending digest to ${user.email}`);
        await generateDigest(user._id);
    }
};

const initCronJobs = () => {
    if (process.env.VERCEL) {
        console.log("Vercel environment detected. Cron jobs handled by Vercel Cron.");
        return;
    }

    // ==========================================
    // SCHEDULE CONFIGURATION
    // ==========================================
    // FOR TESTING:    '*/5 * * * *'  (Run every 5 minutes)
    // FOR PRODUCTION: '0 * * * *'    (Run every hour)

    // CURRENT SETTING:
    const scheduleFrequency = '*/5 * * * *';

    cron.schedule(scheduleFrequency, async () => {
        await runScheduledCheck();
    });
};

module.exports = { initCronJobs, runScheduledCheck };