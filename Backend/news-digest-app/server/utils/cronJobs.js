const cron = require('node-cron');
const User = require('../models/User');
const { generateDigest } = require('../services/digestService');

const runScheduledCheck = async (forceHour = null) => {
    const currentHour = forceHour !== null ? forceHour : new Date().getHours();
    const hourString = String(currentHour).padStart(2, '0');
    console.log(`Running scheduled check for hour: ${hourString}:00`);

    const users = await User.find({ isSubscribed: true });

    for (const user of users) {
        let shouldSend = false;

        if (user.scheduleType === 'custom') {
            if (user.customScheduleTimes && user.customScheduleTimes.includes(hourString)) {
                shouldSend = true;
            }
        } else {
            // Default 'every12': Send at 8 AM and 8 PM (08 and 20) or 00 and 12?
            // Original was 0 */12 * * * which is 00:00 and 12:00.
            if (currentHour === 0 || currentHour === 12) {
                shouldSend = true;
            }
        }

        if (shouldSend) {
            console.log(`Sending digest to ${user.email}`);
            await generateDigest(user._id);
        }
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