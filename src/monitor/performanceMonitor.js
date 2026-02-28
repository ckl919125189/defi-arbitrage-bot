/**
 * 性能监控器
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      arbitrageFound: 0,
      profitableTrades: 0,
      totalProfitUSD: 0,
      avgExecutionTime: 0,
      pricesFetched: 0
    };
    
    this.executionTimes = [];
    this.priceHistory = {};
  }

  /**
   * 记录请求
   */
  recordRequest() {
    this.metrics.requests++;
    this.metrics.pricesFetched++;
  }

  /**
   * 记录错误
   */
  recordError() {
    this.metrics.errors++;
  }

  /**
   * 记录套利发现
   */
  recordArbitrageFound() {
    this.metrics.arbitrageFound++;
  }

  /**
   * 记录盈利交易
   */
  recordProfitableTrade(profitUSD) {
    this.metrics.profitableTrades++;
    this.metrics.totalProfitUSD += profitUSD;
  }

  /**
   * 记录执行时间
   */
  recordExecutionTime(ms) {
    this.executionTimes.push(ms);
    
    // 保持最近 100 条记录
    if (this.executionTimes.length > 100) {
      this.executionTimes.shift();
    }
    
    // 计算平均值
    this.metrics.avgExecutionTime = 
      this.executionTimes.reduce((a, b) => a + b, 0) / 
      this.executionTimes.length;
  }

  /**
   * 记录价格
   */
  recordPrice(token, dex, price) {
    if (!this.priceHistory[token]) {
      this.priceHistory[token] = {};
    }
    if (!this.priceHistory[token][dex]) {
      this.priceHistory[token][dex] = [];
    }
    
    this.priceHistory[token][dex].push({
      price,
      timestamp: Date.now()
    });
    
    // 保持最近 1000 条记录
    if (this.priceHistory[token][dex].length > 1000) {
      this.priceHistory[token][dex].shift();
    }
  }

  /**
   * 获取运行时间
   */
  getUptime() {
    return Date.now() - this.metrics.startTime;
  }

  /**
   * 获取统计数据
   */
  getStats() {
    const uptime = this.getUptime();
    const uptimeHours = uptime / (1000 * 60 * 60);
    
    return {
      ...this.metrics,
      uptime: this.formatUptime(uptime),
      uptimeHours: uptimeHours.toFixed(2),
      uptimeDays: (uptimeHours / 24).toFixed(2),
      errorRate: this.metrics.requests > 0 
        ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%'
        : '0%',
      avgProfitPerTrade: this.metrics.profitableTrades > 0
        ? (this.metrics.totalProfitUSD / this.metrics.profitableTrades).toFixed(2)
        : '0',
      requestsPerHour: uptimeHours > 0
        ? (this.metrics.requests / uptimeHours).toFixed(0)
        : '0'
    };
  }

  /**
   * 格式化运行时间
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天 ${hours % 24}小时`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 打印状态报告
   */
  printReport() {
    const stats = this.getStats();
    
    console.log(`
╔═══════════════════════════════════════════════════╗
║           📊 性能监控报告                        ║
╠═══════════════════════════════════════════════════╣
║  运行时间: ${stats.uptime.padEnd(37)}║
║  总请求数: ${stats.requests.toString().padEnd(37)}║
║  价格获取: ${stats.pricesFetched.toString().padEnd(37)}║
║  发现套利: ${stats.arbitrageFound.toString().padEnd(37)}║
║  盈利交易: ${stats.profitableTrades.toString().padEnd(37)}║
║  总利润:   $${stats.totalProfitUSD.toString().padEnd(36)}║
║  平均执行: ${stats.avgExecutionTime.toFixed(0)}ms${' '.repeat(33)}║
║  错误率:   ${stats.errorRate.padEnd(37)}║
╚═══════════════════════════════════════════════════╝
    `);
  }

  /**
   * 重置统计
   */
  reset() {
    this.metrics.requests = 0;
    this.metrics.errors = 0;
    this.metrics.arbitrageFound = 0;
    this.metrics.profitableTrades = 0;
    this.metrics.totalProfitUSD = 0;
    this.executionTimes = [];
  }

  /**
   * 导出 Prometheus 格式
   */
  toPrometheusFormat() {
    const stats = this.getStats();
    
    return `
# HELP arbitrage_bot_uptime_seconds Bot uptime in seconds
# TYPE arbitrage_bot_uptime_seconds gauge
arbitrage_bot_uptime_seconds ${this.metrics.startTime}

# HELP arbitrage_bot_requests_total Total number of requests
# TYPE arbitrage_bot_requests_total counter
arbitrage_bot_requests_total ${stats.requests}

# HELP arbitrage_bot_errors_total Total number of errors
# TYPE arbitrage_bot_errors_total counter
arbitrage_bot_errors_total ${stats.errors}

# HELP arbitrage_bot_arbitrage_found Total arbitrage opportunities found
# TYPE arbitrage_bot_arbitrage_found counter
arbitrage_bot_arbitrage_found ${stats.arbitrageFound}

# HELP arbitrage_bot_profitable_trades Total profitable trades
# TYPE arbitrage_bot_profitable_trades counter
arbitrage_bot_profitable_trades ${stats.profitableTrades}

# HELP arbitrage_bot_total_profit_usd Total profit in USD
# TYPE arbitrage_bot_total_profit_usd gauge
arbitrage_bot_total_profit_usd ${stats.totalProfitUSD}

# HELP arbitrage_bot_avg_execution_time_ms Average execution time in ms
# TYPE arbitrage_bot_avg_execution_time_ms gauge
arbitrage_bot_avg_execution_time_ms ${stats.avgExecutionTime}
    `.trim();
  }
}

module.exports = PerformanceMonitor;
