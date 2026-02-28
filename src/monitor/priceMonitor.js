/**
 * 价格监控器
 */
class PriceMonitor {
  constructor(dexAdapters, config, alertService = null) {
    this.dexAdapters = dexAdapters;
    this.config = config;
    this.alertService = alertService;
    this.prices = {};
    this.interval = null;
    this.arbitrageHistory = [];
  }

  /**
   * 开始监控
   */
  start() {
    console.log('🔄 价格监控已启动\n');
    this.fetchPrices();
    this.interval = setInterval(() => {
      this.fetchPrices();
    }, this.config.monitor.interval);
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('\n🛑 价格监控已停止');
    }
  }

  /**
   * 获取所有 DEX 的价格
   */
  async fetchPrices() {
    const tokens = Object.keys(this.config.tokens);
    
    for (const token of tokens) {
      const tokenAddress = this.config.tokens[token];
      
      for (const dex of this.dexAdapters) {
        try {
          const price = await dex.getPrice(tokenAddress);
          if (price) {
            if (!this.prices[token]) {
              this.prices[token] = {};
            }
            this.prices[token][dex.name] = price;
          }
        } catch (error) {
          // 静默处理错误
        }
      }
    }

    this.detectArbitrage();
  }

  /**
   * 检测套利机会
   */
  detectArbitrage() {
    const tokens = Object.keys(this.prices);
    
    for (const token of tokens) {
      const dexPrices = this.prices[token];
      const dexNames = Object.keys(dexPrices);
      
      if (dexNames.length < 2) continue;
      
      // 找出最高和最低价格
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      let minDex = '';
      let maxDex = '';
      
      for (const dex of dexNames) {
        if (dexPrices[dex] < minPrice) {
          minPrice = dexPrices[dex];
          minDex = dex;
        }
        if (dexPrices[dex] > maxPrice) {
          maxPrice = dexPrices[dex];
          maxDex = dex;
        }
      }
      
      // 计算价差
      const priceDiff = maxPrice - minPrice;
      const priceDiffPercent = (priceDiff / minPrice) * 100;
      
      // 检查是否满足最小价差
      if (priceDiffPercent > 0.3) { // 超过 0.3% 算套利机会
        // 计算预估利润（假设交易 1000 USD）
        const volume = 1000;
        const gasCost = 5; // 预估 Gas 成本
        const profit = calculateProfit(minPrice, maxPrice, volume, gasCost);
        
        if (profit.isProfitable) {
          const opportunity = {
            token,
            buyDex: minDex,
            sellDex: maxDex,
            buyPrice: minPrice,
            sellPrice: maxPrice,
            priceDiff,
            priceDiffPercent,
            volume,
            gasCost,
            ...profit,
            timestamp: Date.now()
          };
          
          this.arbitrageHistory.push(opportunity);
          
          // 发送提醒
          if (this.alertService) {
            this.alertService.sendArbitrageAlert(opportunity);
          }
        }
      }
    }
  }

  /**
   * 获取当前价格
   */
  getPrices() {
    return this.prices;
  }

  /**
   * 获取套利历史
   */
  getHistory() {
    return this.arbitrageHistory;
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.arbitrageHistory = [];
  }
}

/**
 * 计算利润
 */
function calculateProfit(buyPrice, sellPrice, volume, gasCostUSD) {
  const buyAmount = volume / buyPrice;
  const sellRevenue = buyAmount * sellPrice;
  const profit = sellRevenue - volume - gasCostUSD;
  const profitPercent = ((sellRevenue - volume) / volume) * 100;
  
  return {
    profitUSD: profit,
    profitPercent,
    sellRevenue,
    gasCost: gasCostUSD,
    isProfitable: profit > 0
  };
}

module.exports = PriceMonitor;
