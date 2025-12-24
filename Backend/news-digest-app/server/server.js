const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { initCronJobs } = require('./utils/cronJobs');

const app = express();
app.use(express.json());
app.use(cors());

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/cron', require('./routes/cron'));


// Start Cron
initCronJobs();

const PORT = process.env.PORT || 5000;

// Only listen if not in a serverless environment (Vercel exports the app instead)
if (!process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;