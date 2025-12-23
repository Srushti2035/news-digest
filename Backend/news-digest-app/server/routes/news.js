const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { generateDigest, fetchNewsForTopics } = require('../services/digestService');

// Get User Profile
router.get('/profile', auth, async (req, res) => {
    const user = await User.findById(req.user.userId);
    res.json(user);
});

// Update Topics & Subscription
router.patch('/update-preferences', auth, async (req, res) => {
    const { topics, isSubscribed, goodNewsOnly, scheduleType, customScheduleTimes } = req.body;

    // Check if user is subscribing for the first time (or re-subscribing)
    const currentUser = await User.findById(req.user.userId);
    const wasSubscribed = currentUser.isSubscribed;

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { topics, isSubscribed, goodNewsOnly, scheduleType, customScheduleTimes },
        { new: true }
    );

    // Send welcome email ONLY if they subscribe and haven't received it before
    if (isSubscribed && !user.hasReceivedWelcomeEmail) {
        const { sendWelcomeEmail } = require('../services/digestService');
        await sendWelcomeEmail(user);

        // Mark as received so they don't get it again
        await User.findByIdAndUpdate(req.user.userId, { hasReceivedWelcomeEmail: true });
    }

    res.json(user);
});

// Manual Trigger: Send Now
router.post('/send-now', auth, async (req, res) => {
    await generateDigest(req.user.userId);
    res.json({ message: "Digest sent successfully!" });
});

// News Preview Route
router.get('/preview', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const articles = await fetchNewsForTopics(user.topics, user.goodNewsOnly);
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Trending Suggestions Route
router.get('/suggestions', auth, async (req, res) => {
    try {
        const { fetchTrendingSuggestions } = require('../services/digestService');
        const suggestions = await fetchTrendingSuggestions();
        res.json(suggestions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;