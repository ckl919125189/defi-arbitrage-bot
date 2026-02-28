/**
 * OKX 价格获取
 */
const axios = require('axios');

class OKXAdapter {
  constructor(config) {
    this.name = 'OKX';
    this.baseUrl = 'https://www.okx.com/api/v5/market';
    this.cache = new Map();
    this.cacheTime = 5000;
  }

  async getPrice(tokenAddress) {
    const cacheKey = tokenAddress;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < this.cacheTime) {
      return cached.price;
    }

    const pairs = {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ETH-USDT',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC-USDT',
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT-USDT',
      '0x6b175474e89094c44da98b954eedccbfd9e5bfa': 'DAI-USDT',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'BTC-USDT'
    };

    const symbol = pairs[tokenAddress.toLowerCase()];
    if (!symbol) return null;

    try {
      const response = await axios.get(
        `${this.baseUrl}/ticker?instId=${symbol}`,
        { timeout: 5000 }
      );
      
      if (response.data.code === '0' && response.data.data.length > 0) {
        const price = parseFloat(response.data.data[0].last);
        this.cache.set(cacheKey, { price, time: Date.now() });
        return price;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = OKXAdapter;
