const express = require('express');
const router = express.Router();
const { runScheduledCheck } = require('../utils/cronJobs');

// Authentication middleware to protect this route (Vercel secures crons, but good to have)
// For simplicity in this demo, accessing it directly triggers it. 
// In production, you might check for a specific header 'Authorization': `Bearer ${process.env.CRON_SECRET}`

router.get('/trigger-digest', async (req, res) => {
    try {
        console.log("Manual or Vercel Cron Trigger received.");
        // We can pass an optional hour query param?hour=8 to force a specific time check
        const hour = req.query.hour ? parseInt(req.query.hour) : null;

        await runScheduledCheck(hour);
        res.status(200).json({ message: "Digest check completed successfully." });
    } catch (error) {
        console.error("Cron Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
