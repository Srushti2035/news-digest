# 📰 News Digest Application

A smart, personalized news aggregator that delivers reading material directly to your inbox. Users can subscribe to their favorite topics (e.g., "Technology", "Space", "Finance") and receive a curated email digest every day.

## 🚀 Project Overview
This is a "Monorepo" project, meaning it contains both the Frontend (website) and Backend (API) in one place.
- **Frontend**: A React dashboard where users can login, manage topics, and toggle "Good News Only" filters.
- **Backend**: A Node.js system that fetches news, processes it, and manages email delivery.

## 🛠 Tech Stack

### Frontend
1.  **React.js**: The core library used for building the interactive user interface and managing state (hooks like `useState`, `useEffect`).
2.  **Tailwind CSS**: A utility-first CSS framework used for styling the application, ensuring it looks modern and works on all device sizes (responsive).
3.  **React Router**: Manages navigation within the app (Single Page Application), allowing users to switch between Login, Registration, and Dashboard without reloading.
4.  **Lucide React**: Provides the clean, modern icons used throughout the app (e.g., Eye icon for password, Bell for subscription, Trash for deleting topics).
5.  **Axios**: A promise-based HTTP client used to communicate with the Backend API (sending login data, fetching user profiles, etc.).
6.  **Vercel Static Hosting**: The platform where the optimized manufacturing build of the React app lives and is served to users worldwide.

### Backend
1.  **Node.js & Express.js**: The server-side environment and web framework that handles all API requests, routing, and logic.
2.  **MongoDB Atlas**: The cloud database (NoSQL) that securely stores User data, Subscriptions, Topics, and Password Reset tokens.
3.  **Brevo (formerly Sendinblue)**: The email delivery service used to send the HTML-rich Daily News Digests and Password Reset emails.
4.  **NewsAPI.org**: The external data provider we connect to for fetching the latest headlines and articles based on user topics.
5.  **Serverless Architecture**: The app is designed to run on Vercel as "Serverless Functions", meaning the server wakes up only when needed (cheaper and scalable).
6.  **Vercel Cron**: A built-in scheduler that triggers the backend Logic automatically every day to send out the mass email digests.

---

## 🔑 Environment Variables
You need these secret keys to make the app work. Create a `.env` file in your `Backend/news-digest-app/server/` folder for local development.

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | Connection string for MongoDB Atlas |
| `JWT_SECRET` | Secret key for signing login secure tokens (type anything random) |
| `BREVO_API_KEY` | API Key from Brevo for sending emails (`xkeysib-...`) |
| `NEWS_API_KEY` | API Key from NewsAPI.org for fetching articles |
| `FRONTEND_URL` | URL of your website (e.g., `http://localhost:3000` or `https://news-digest.vercel.app`) |

---

## 💻 Setup Instructions (Run Locally)

### 1. Clone the Project
```bash
git clone <your-repo-url>
cd NewsDigest
```

### 2. Setup Backend
```bash
cd Backend/news-digest-app/server
npm install
# Create your .env file here with the keys above
npm start
# Server will run on http://localhost:5000
```

### 3. Setup Frontend
Open a new terminal confirmation:
```bash
cd Frontend
npm install
npm start
# App will open at http://localhost:3000
```

---

## 🌍 Setup Instructions (First Time Deployment)

1.  **Push to GitHub**: Make sure your code is on GitHub.
2.  **Go to Vercel**: Log in and click **"Add New Project"**.
3.  **Import**: Select your `NewsDigest` repository.
4.  **Framework Preset**: Select **"Other"** (Important! Do NOT select Create React App, because we have a custom `vercel.json` doing the work).
5.  **Environment Variables**: extensive Copy-paste all your `.env` keys (`MONGO_URI`, `BREVO_API_KEY`, etc.) into the Environment Variables section.
6.  **Deploy**: Click **Deploy**. Vercel will build the frontend and backend and give you a live URL.

---

## ☁️ Deployment Explanation (How it works on Vercel)
This app is deployed on **Vercel** using a "Serverless" architecture.

### 1. Serverless Backend
Normally, a Node.js server runs 24/7 and costs money.
BUT, we configured this app to be **Serverless**.
- **How?**: In `server.js`, we export the app (`module.exports = app`) instead of just listening on a port.
- **Vercel Config**: The `vercel.json` file tells Vercel to take that file and turn it into an on-demand function.
- **Result**: When someone hits `/api/login`, Vercel wakes up the server, handles the login, and shuts it down instantly. It's cheaper and scales automatically.

### 2. Cron Jobs (Automated Emails)
We use **Vercel Cron** to send the daily emails automatically.
- **Configuration**: Inside `vercel.json`, we have a `crons` section:
  ```json
  "crons": [
    {
      "path": "/api/cron/trigger-digest",
      "schedule": "0 12 * * *"
    }
  ]
  ```
- **What this does**: Every day at **12:00 PM UTC** (which is roughly 5:30 PM IST), Vercel automatically "visits" that hidden URL.
- **The Result**: That URL triggers our backend code to loop through all subscribed users and send them their personalized news digest via Brevo.

---

## 🚀 How to Deploy Updates
1. Make changes to your code.
2. Run:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Vercel detects the change and automatically redeploys your site in seconds!
