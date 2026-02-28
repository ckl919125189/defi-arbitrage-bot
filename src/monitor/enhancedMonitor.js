/**
 * 价格监控器 - 增强版
 */
class EnhancedPriceMonitor {
  constructor(dexAdapters, config, alertService = null) {
    this.dexAdapters = dexAdapters;
    this.config = config;
    this.alertService = alertService;
    this.prices = {};
    this.priceHistory = {};
    this.arbitrageHistory = [];
    this.interval = null;
    this.stats = {
      startTime: Date.now(),
      totalScans: 0,
      opportunitiesFound: 0,
      profitableCount: 0
    };
  }

  /**
   * 开始监控
   */
  start() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              🔄 价格监控已启动                              ║
╚═══════════════════════════════════════════════════════════════╝
`);
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
   * 获取所有价格
   */
  async fetchPrices() {
    this.stats.totalScans++;
    const tokens = Object.keys(this.config.tokens);
    
    console.clear();
    this.printHeader();
    
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
          // 静默处理
        }
      }
    }

    this.printPrices();
    this.detectArbitrage();
  }

  /**
   * 打印头部
   */
  printHeader() {
    const uptime = this.getUptime();
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            🤖 DeFi 套利机器人 v1.2                         ║
╠═══════════════════════════════════════════════════════════════╣
║  运行时间: ${uptime.padEnd(54)}║
║  扫描次数: ${this.stats.totalScans.toString().padEnd(54)}║
╚═══════════════════════════════════════════════════════════════╝
`);
  }

  /**
   * 打印价格表
   */
  printPrices() {
    console.log('📊 当前市场价格:');
    console.log('─────────────────────────────────────────────────────────────');
    
    const tokens = Object.keys(this.prices);
    if (tokens.length === 0) {
      console.log('   等待数据...');
      return;
    }

    for (const token of tokens) {
      const dexPrices = this.prices[token];
      const dexNames = Object.keys(dexPrices);
      
      if (dexNames.length === 0) continue;
      
      const avg = dexNames.reduce((sum, dex) => sum + dexPrices[dex], 0) / dexNames.length;
      
      console.log(`\n  💰 ${token.padEnd(8)} 平均: $${avg.toFixed(2)}`);
      
      for (const dex of dexNames) {
        const price = dexPrices[dex];
        const diff = ((price - avg) / avg * 100).toFixed(2);
        const diffStr = diff >= 0 ? `+${diff}%` : `${diff}%`;
        
        console.log(`     ${dex.padEnd(12)} $${price.toFixed(2).padStart(10)}  ${diffStr}`);
      }
    }
    
    console.log('─────────────────────────────────────────────────────────────');
  }

  /**
   * 检测套利机会
   */
  detectArbitrage() {
    const tokens = Object.keys(this.prices);
    let opportunities = [];
    
    for (const token of tokens) {
      const dexPrices = this.prices[token];
      const dexNames = Object.keys(dexPrices);
      
      if (dexNames.length < 2) continue;
      
      let minPrice = Infinity, maxPrice = -Infinity;
      let minDex = '', maxDex = '';
      
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
      
      const priceDiff = maxPrice - minPrice;
      const priceDiffPercent = (priceDiff / minPrice) * 100;
      
      if (priceDiffPercent > 0.3) {
        const volume = 1000;
        const gasCost = 5;
        const profit = this.calculateProfit(minPrice, maxPrice, volume, gasCost);
        
        opportunities.push({
          token,
          buyDex: minDex,
          sellDex: maxDex,
          buyPrice: minPrice,
          sellPrice: maxPrice,
          priceDiff,
          priceDiffPercent,
          ...profit
        });
        
        if (profit.isProfitable) {
          this.stats.profitableCount++;
        }
      }
    }
    
    this.printArbitrage(opportunities);
  }

  /**
   * 打印套利机会
   */
  printArbitrage(opportunities) {
    this.stats.opportunitiesFound = opportunities.length;
    
    if (opportunities.length === 0) {
      console.log('\n🎯 暂未发现套利机会');
      return;
    }

    console.log(`\n🎯 发现 ${opportunities.length} 个套利机会:`);
    console.log('═════════════════════════════════════════════════════════════');
    
    opportunities.sort((a, b) => b.profitUSD - a.profitUSD);
    
    for (const opp of opportunities) {
      const emoji = opp.isProfitable ? '🟢' : '🔴';
      console.log(`
  ${emoji} ${opp.token}
     买入: ${opp.buyDex} @ $${opp.buyPrice.toFixed(2)}
     卖出: ${opp.sellDex} @ $${opp.sellPrice.toFixed(2)}
     价差: $${opp.priceDiff.toFixed(2)} (${opp.priceDiffPercent.toFixed(2)}%)
     预估利润: $${opp.profitUSD.toFixed(2)} (${opp.profitPercent.toFixed(2)}%)
`);
    }
    console.log('═════════════════════════════════════════════════════════════');
  }

  /**
   * 计算利润
   */
  calculateProfit(buyPrice, sellPrice, volume, gasCost) {
    const buyAmount = volume / buyPrice;
    const sellRevenue = buyAmount * sellPrice;
    const profit = sellRevenue - volume - gasCost;
    const profitPercent = ((sellRevenue - volume) / volume) * 100;
    
    return {
      profitUSD: profit,
      profitPercent,
      isProfitable: profit > 0
    };
  }

  /**
   * 获取运行时间
   */
  getUptime() {
    const ms = Date.now() - this.stats.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    
    if (d > 0) return `${d}天 ${h % 24}小时`;
    if (h > 0) return `${h}小时 ${m % 60}分钟`;
    if (m > 0) return `${m}分钟 ${s % 60}秒`;
    return `${s}秒`;
  }

  getStats() {
    return { ...this.stats, uptime: this.getUptime() };
  }

  getPrices() {
    return this.prices;
  }

  getHistory() {
    return this.arbitrageHistory;
  }
}

module.exports = EnhancedPriceMonitor;
