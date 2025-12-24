const axios = require('axios');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const User = require('../models/User');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Configure Brevo (Sendinblue)
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const DASHBOARD_URL = 'https://news-digest-beta.vercel.app/dashboard'; // TODO: Update for production
// const DASHBOARD_URL = 'http://localhost:3000/dashboard';

const filterGoodNews = (articles) => {
    return articles.filter(article => {
        const textToCheck = `${article.title} ${article.description || ''}`;
        const result = sentiment.analyze(textToCheck);
        return result.score >= 0; // Keep neutral and positive news
    });
};

const fetchNewsForTopics = async (topics, goodNewsOnly = false) => {
    const allArticles = [];
    for (const topic of topics) {
        try {
            const response = await axios.get(`https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`);
            if (response.data.articles) {
                let articles = response.data.articles.map(art => ({ ...art, topic }));

                if (goodNewsOnly) {
                    articles = filterGoodNews(articles);
                }

                // Limit to 3 after filtering to ensure quality
                allArticles.push(...articles.slice(0, 3));
            }
        } catch (error) {
            console.error(`Error fetching news for topic ${topic}:`, error.message);
        }
    }
    return allArticles;
};

const { sendEmail } = require('./emailService');

const sendWelcomeEmail = async (user) => {
    const htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome Aboard!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi there,</p>
                        <p>Thanks for subscribing to <strong>News Digest</strong>! You're now set up to receive your personalized daily news updates every 12 hours.</p>
                        <p>We'll curate the best stories for your topics: <strong>${user.topics.join(', ')}</strong>.</p>
                        <div style="margin-top: 20px; text-align: center;">
                            <a href="${DASHBOARD_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Preferences</a>
                        </div>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        &copy; ${new Date().getFullYear()} News Digest. All rights reserved.
                    </div>
                </div>
            </body>
        </html>
    `;
    await sendEmail({ to: user.email, subject: "Welcome to News Digest! 🗞️", htmlContent });
};

const generateDigest = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || user.topics.length === 0) return;

        const articles = await fetchNewsForTopics(user.topics, user.goodNewsOnly);

        if (articles.length === 0) return;

        let newsContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">Your Daily Digest</h1>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        `;

        // Group by topic
        const articlesByTopic = articles.reduce((acc, art) => {
            acc[art.topic] = acc[art.topic] || [];
            acc[art.topic].push(art);
            return acc;
        }, {});

        for (const [topic, topicArticles] of Object.entries(articlesByTopic)) {
            newsContent += `
                <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 20px; text-transform: capitalize;">
                    ${topic}
                </h2>
                <ul style="list-style-type: none; padding: 0;">
            `;

            topicArticles.forEach(art => {
                newsContent += `
                    <li style="margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px;">
                        <a href="${art.url}" style="color: #2563eb; text-decoration: none; font-weight: bold; font-size: 16px; display: block; margin-bottom: 5px;">
                            ${art.title}
                        </a>
                        <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                            ${art.description || 'No description available.'}
                        </p>
                        <div style="margin-top: 5px; font-size: 12px; color: #9ca3af;">
                            Source: ${art.source.name}
                        </div>
                    </li>
                `;
            });

            newsContent += `</ul>`;
        }

        newsContent += `
                    <p style="text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af;">
                        You received this email because you subscribed to News Digest. 
                        <a href="${DASHBOARD_URL}" style="color: #2563eb;">Unsubscribe</a>
                    </p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: `Your Daily News for ${new Date().toLocaleDateString()}`,
            htmlContent: `<html><body>${newsContent}</body></html>`
        });

    } catch (error) {
        console.error("Error in generateDigest:", error.message);
    }
};

const fetchTrendingSuggestions = async () => {
    try {
        // Fetch top general headlines for suggestions
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`);
        if (!response.data.articles) return [];

        // Extract simplified patterns to use as suggestions
        // Since NewsAPI doesn't give "trending topics" directly, we'll derive them from Source Names or extract key terms manually or just return generic categories.
        // Better yet, for "Suggestions", users usually want Categories or "Hot Topics"
        // Let's return a mix of static categories and some "In the News" items derived from titles.

        // Approach: Return trending Sources and generalized Categories for now as 'Tokens' they can add.
        // Actually, the user asked for "live data" suggestions. 
        // Let's return the simplified article Titles/Sources as "Trending Now".

        const trendingArticles = response.data.articles.map(article => ({
            title: article.title,
            source: article.source.name,
            url: article.url,
            urlToImage: article.urlToImage
        })).filter(a => a.urlToImage); // Only good visual ones

        return trendingArticles;
    } catch (error) {
        console.error("Error fetching trending news:", error.message);
        return [];
    }
};

module.exports = { generateDigest, sendWelcomeEmail, fetchNewsForTopics, fetchTrendingSuggestions };
