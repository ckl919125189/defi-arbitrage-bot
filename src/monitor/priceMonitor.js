/**
 * 价格监控器
 */
class PriceMonitor {
  constructor(dexAdapters, config) {
    this.dexAdapters = dexAdapters;
    this.config = config;
    this.prices = {};
    this.interval = null;
  }

  /**
   * 开始监控
   */
  start() {
    console.log('🔄 价格监控已启动');
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
      console.log('🛑 价格监控已停止');
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
          console.error(`[Monitor] ${dex.name} 获取 ${token} 价格失败`);
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
      
      if (priceDiffPercent > 0.5) { // 超过 0.5% 算套利机会
        console.log('\n🎯 套利机会！');
        console.log(`   代币: ${token}`);
        console.log(`   最低价: ${minDex} $${minPrice.toFixed(4)}`);
        console.log(`   最高价: ${maxDex} $${maxPrice.toFixed(4)}`);
        console.log(`   价差: $${priceDiff.toFixed(2)} (${priceDiffPercent.toFixed(2)}%)`);
        
        // 检查是否满足最小利润
        const estimatedProfit = priceDiff * 1000; // 假设交易 1000 代币
        if (estimatedProfit > this.config.monitor.minProfitUSD) {
          this.sendAlert(token, minDex, maxDex, minPrice, maxPrice, priceDiffPercent, estimatedProfit);
        }
      }
    }
  }

  /**
   * 发送提醒
   */
  sendAlert(token, buyDex, sellDex, buyPrice, sellPrice, percent, profit) {
    const message = `
🎯 *套利机会发现！*

*代币:* ${token}
*买入:* ${buyDex} @ $${buyPrice.toFixed(4)}
*卖出:* ${sellDex} @ $${sellPrice.toFixed(4)}
*价差:* ${percent.toFixed(2)}%
*预估利润:* $${profit.toFixed(2)}
    `.trim();

    console.log('\n' + message);
  }

  /**
   * 获取当前价格
   */
  getPrices() {
    return this.prices;
  }
}

module.exports = PriceMonitor;
