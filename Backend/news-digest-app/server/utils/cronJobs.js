const cron = require('node-cron');
const User = require('../models/User');
const { generateDigest } = require('../services/digestService');

const runScheduledCheck = async (forceHour = null) => {
    const currentHour = forceHour !== null ? forceHour : new Date().getHours();
    const hourString = String(currentHour).padStart(2, '0');
    console.log(`Running scheduled check for hour: ${hourString}:00`);

    const users = await User.find({ isSubscribed: true });

    if (users.length === 0) {
        console.log('No subscribed users found.');
        return;
    }

    // Send to ALL subscribed users (Since Vercel triggers this once daily at 5:30 PM)
    for (const user of users) {
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