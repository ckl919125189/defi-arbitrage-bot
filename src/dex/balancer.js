/**
 * Balancer DEX 适配器
 */
const axios = require('axios');

class BalancerAdapter {
  constructor(config) {
    this.name = 'Balancer';
    this.factory = config.factory;
    this.vault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
    this.apiUrl = 'https://api.balancer.fi';
  }

  /**
   * 获取代币价格
   */
  async getPrice(tokenA, tokenB = 'USDC') {
    try {
      // 使用 Coingecko 作为备用价格源
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
      console.error(`[Balancer] 获取价格失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取池子信息
   */
  async getPoolInfo(poolId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/pools/${poolId}`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取所有池子
   */
  async getAllPools() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/pools/ethereum`
      );
      return response.data.pools;
    } catch (error) {
      console.error(`[Balancer] 获取池子列表失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取池子交易价格（通过 GraphQL）
   */
  async getPoolSpotPrice(poolId, tokenIn, tokenOut) {
    try {
      const query = `
        query {
          pool(id: "${poolId}") {
            tokens {
              symbol
              balance
            }
            spotPriceCalculated
          }
        }
      `;
      
      const response = await axios.post(
        'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
        { query }
      );
      
      return response.data?.data?.pool?.spotPriceCalculated;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取加权池代币价格
   */
  async getWeightedPoolPrices(pool) {
    try {
      const tokens = pool.tokens || [];
      let totalValue = 0;
      let totalWeight = 0;
      
      for (const token of tokens) {
        const price = await this.getPrice(token.address);
        if (price) {
          totalValue += price * parseFloat(token.balance);
          totalWeight += parseFloat(token.weight || 0);
        }
      }
      
      return totalWeight > 0 ? totalValue / totalWeight : totalValue;
    } catch (error) {
      return null;
    }
  }
}

module.exports = BalancerAdapter;
