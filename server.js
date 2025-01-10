require('dotenv').config();
const fetchCryptoData = require('./jobs/fetchCryptoData');
fetchCryptoData();

const express = require('express');
const mongoose = require('mongoose');
const startScheduler = require('./scheduler');
const Crypto = require('./models/Crypto');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the scheduler
startScheduler();

// /stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const { coin } = req.query;

    // Check if the coin parameter is provided
    if (!coin) {
      return res.status(400).json({ error: 'Query param `coin` is required.' });
    }

    // Fetch the latest record for the requested cryptocurrency
    const cryptoData = await Crypto.findOne({ id: coin }).sort({ updatedAt: -1 });

    if (!cryptoData) {
      return res.status(404).json({ error: 'Cryptocurrency data not found.' });
    }

    res.json({
      price: cryptoData.price,
      marketCap: cryptoData.marketCap,
      "24hChange": cryptoData.change24h,
    });
  } catch (error) {
    console.error('Error in /stats API:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// /deviation endpoint
app.get('/deviation', async (req, res) => {
  try {
    const { coin } = req.query;

    // Check if the coin parameter is provided
    if (!coin) {
      return res.status(400).json({ error: 'Query param `coin` is required.' });
    }

    // Fetch the last 100 records for the requested coin
    const records = await Crypto.find({ id: coin }).sort({ updatedAt: -1 }).limit(100);

    if (!records.length) {
      return res.status(404).json({ error: 'No records found for the requested cryptocurrency.' });
    }

    // Extract prices
    const prices = records.map(record => record.price);

    // Calculate mean of the prices
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Calculate variance (the sum of squared differences from the mean)
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;

    // Calculate standard deviation
    const deviation = Math.sqrt(variance);

    res.json({ deviation: deviation.toFixed(2) });
  } catch (error) {
    console.error('Error in /deviation API:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
