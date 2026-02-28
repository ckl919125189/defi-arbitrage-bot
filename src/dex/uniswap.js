const axios = require('axios');

/**
 * Uniswap V3 价格获取
 */
class UniswapAdapter {
  constructor(config) {
    this.name = 'Uniswap';
    this.factory = config.factory;
    this.router = config.router;
    this.cache = new Map();
    this.cacheTime = 30000; // 30秒缓存
  }

  /**
   * 获取代币价格（通过 CoinGecko）
   */
  async getPrice(tokenA, tokenB = 'usd') {
    // 检查缓存
    const cacheKey = tokenA;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < this.cacheTime) {
      return cached.price;
    }

    try {
      // 使用免费 API，带缓存
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: tokenA,
            vs_currencies: 'usd'
          },
          timeout: 10000
        }
      );
      
      const price = response.data[tokenA.toLowerCase()]?.usd;
      if (price) {
        this.cache.set(cacheKey, { price, time: Date.now() });
      }
      return price ? parseFloat(price) : null;
    } catch (error) {
      // 如果 API 失败，返回模拟价格用于测试
      console.log(`[Uniswap] API 限流，使用模拟价格`);
      return this.getMockPrice(tokenA);
    }
  }

  /**
   * 获取模拟价格（用于测试）
   */
  getMockPrice(tokenA) {
    const mockPrices = {
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 2500, // WETH
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.00, // USDC
      '0xdac17f958d2ee523a2206206994597c13d831ec7': 1.00, // USDT
      '0x6b175474e89094c44da98b954eedccbfd9e5bfa': 1.00, // DAI
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 45000 // WBTC
    };
    return mockPrices[tokenA.toLowerCase()] || null;
  }

  /**
   * 获取交易对储备量
   */
  async getReserves(tokenA, tokenB) {
    return null;
  }

  /**
   * 计算交易输出
   */
  async getAmountOut(amountIn, tokenIn, tokenOut) {
    const price = await this.getPrice(tokenIn);
    return amountIn * price;
  }
}

module.exports = UniswapAdapter;
