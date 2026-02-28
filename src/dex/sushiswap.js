const axios = require('axios');

/**
 * SushiSwap 价格获取
 */
class SushiSwapAdapter {
  constructor(config) {
    this.name = 'SushiSwap';
    this.factory = config.factory;
    this.router = config.router;
  }

  /**
   * 获取代币价格
   */
  async getPrice(tokenA, tokenB = 'USDC') {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum`,
        {
          params: {
            contract_addresses: tokenA,
            vs_currencies: 'usd'
          }
        }
      );
      
      const price = response.data[tokenA.toLowerCase()]?.usd;
      return price ? parseFloat(price) : null;
    } catch (error) {
      console.error(`[SushiSwap] 获取价格失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 计算交易输出
   */
  async getAmountOut(amountIn, tokenIn, tokenOut) {
    const price = await this.getPrice(tokenIn);
    return amountIn * price;
  }
}

module.exports = SushiSwapAdapter;
