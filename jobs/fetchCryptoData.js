const axios = require('axios');
const Crypto = require('../models/Crypto');
const moment = require('moment-timezone');

const COINS = ['bitcoin', 'matic-network', 'ethereum'];
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

const fetchCryptoData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        ids: COINS.join(','),
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_change: true,
      },
    });

    const data = response.data;

    const updates = Object.entries(data).map(async ([id, info]) => {
      await Crypto.findOneAndUpdate(
        { id },
        {
          name: id === 'bitcoin' ? 'Bitcoin' : id === 'matic-network' ? 'Matic' : 'Ethereum',
          id,
          price: info.usd,
          marketCap: info.usd_market_cap,
          change24h: info.usd_24h_change,
          updatedAt: moment().tz('Asia/Kolkata').format(),
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updates);

    console.log('Cryptocurrency data updated successfully!');
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error.message);
  }
};

module.exports = fetchCryptoData;
