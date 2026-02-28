/**
 * 多交易所价格获取
 */
const axios = require('axios');

class PriceFeed {
  constructor() {
    this.binanceBase = 'https://api.binance.com/api/v3';
    this.cache = new Map();
    this.cacheTime = 10000;
  }

  async getETHPrice() {
    return this.getPrice('ETHUSDT');
  }

  async getBTCPrice() {
    return this.getPrice('BTCUSDT');
  }

  async getPrice(symbol) {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.time < this.cacheTime) {
      return cached.price;
    }

    try {
      const response = await axios.get(
        `${this.binanceBase}/ticker/price?symbol=${symbol}`,
        { timeout: 5000 }
      );
      const price = parseFloat(response.data.price);
      this.cache.set(symbol, { price, time: Date.now() });
      return price;
    } catch (error) {
      return null;
    }
  }
}

module.exports = PriceFeed;
