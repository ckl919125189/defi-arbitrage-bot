/**
 * Web 仪表盘
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

class WebDashboard {
  constructor(port = 3000, monitor = null) {
    this.port = port;
    this.monitor = monitor;
    this.server = null;
  }

  /**
   * 启动服务器
   */
  start() {
    this.server = http.createServer((req, res) => {
      // 设置 CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Content-Type', 'application/json');

      if (req.url === '/api/stats') {
        // 返回统计数据
        const stats = this.monitor ? this.monitor.getStats() : {};
        res.end(JSON.stringify(stats));
      } else if (req.url === '/api/prices') {
        // 返回价格数据
        const prices = this.monitor ? this.monitor.priceHistory : {};
        res.end(JSON.stringify(prices));
      } else if (req.url === '/api/health') {
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      } else if (req.url === '/' || req.url === '/index.html') {
        // 返回 HTML 页面
        res.setHeader('Content-Type', 'text/html');
        res.end(this.getDashboardHTML());
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    this.server.listen(this.port, () => {
      console.log(`📊 Web 仪表盘已启动: http://localhost:${this.port}`);
    });
  }

  /**
   * 停止服务器
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('📊 Web 仪表盘已停止');
    }
  }

  /**
   * 获取仪表盘 HTML
   */
  getDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DeFi 套利机器人监控</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    h1 { text-align: center; margin-bottom: 30px; color: #00ff88; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .stat-card {
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .stat-card h3 { color: #888; font-size: 14px; margin-bottom: 10px; }
    .stat-card .value { font-size: 28px; font-weight: bold; color: #00ff88; }
    .stat-card .value.warning { color: #ffd700; }
    .stat-card .value.error { color: #ff6b6b; }
    .footer { text-align: center; margin-top: 40px; color: #666; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .live { animation: pulse 2s infinite; color: #00ff88; }
  </style>
</head>
<body>
  <h1>🤖 DeFi 套利机器人监控 <span class="live">● LIVE</span></h1>
  
  <div class="stats" id="stats">
    <div class="stat-card">
      <h3>运行时间</h3>
      <div class="value" id="uptime">-</div>
    </div>
    <div class="stat-card">
      <h3>总请求数</h3>
      <div class="value" id="requests">-</div>
    </div>
    <div class="stat-card">
      <h3>发现套利</h3>
      <div class="value" id="arbitrage">-</div>
    </div>
    <div class="stat-card">
      <h3>盈利交易</h3>
      <div class="value" id="profitable">-</div>
    </div>
    <div class="stat-card">
      <h3>总利润</h3>
      <div class="value" id="profit">-</div>
    </div>
    <div class="stat-card">
      <h3>错误率</h3>
      <div class="value" id="errors">-</div>
    </div>
  </div>

  <div class="footer">
    <p>自动更新于 <span id="lastUpdate">-</span></p>
  </div>

  <script>
    async function updateStats() {
      try {
        const [statsRes, healthRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/health')
        ]);
        
        const stats = await statsRes.json();
        const health = await healthRes.json();
        
        document.getElementById('uptime').textContent = stats.uptime || '-';
        document.getElementById('requests').textContent = stats.requests || 0;
        document.getElementById('arbitrage').textContent = stats.arbitrageFound || 0;
        document.getElementById('profitable').textContent = stats.profitableTrades || 0;
        
        const profitEl = document.getElementById('profit');
        profitEl.textContent = '$' + (stats.totalProfitUSD || 0);
        profitEl.className = 'value' + (stats.totalProfitUSD > 0 ? '' : ' warning');
        
        const errorsEl = document.getElementById('errors');
        errorsEl.textContent = stats.errorRate || '0%';
        errorsEl.className = 'value' + (parseFloat(stats.errorRate) > 5 ? ' error' : '');
        
        document.getElementById('lastUpdate').textContent = new Date(health.timestamp).toLocaleTimeString();
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    }

    updateStats();
    setInterval(updateStats, 5000);
  </script>
</body>
</html>
    `;
  }
}

module.exports = WebDashboard;
