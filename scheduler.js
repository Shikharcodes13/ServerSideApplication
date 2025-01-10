const fetchCryptoData = require('./jobs/fetchCryptoData');

const startScheduler = () => {
  // Run the fetchCryptoData function every 2 hours
  setInterval(fetchCryptoData, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
};

module.exports = startScheduler;
