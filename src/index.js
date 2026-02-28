/**
 * DeFi 套利机器人 - 主入口
 */
const fs = require('fs');
const path = require('path');

// 加载配置
const configPath = path.join(__dirname, '../config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.log('📝 请先复制 config.example.json 为 config.json 并配置');
  process.exit(1);
}

// 导入模块
const UniswapAdapter = require('./dex/uniswap');
const SushiSwapAdapter = require('./dex/sushiswap');
const BinanceAdapter = require('./dex/binance');
const OKXAdapter = require('./dex/okx');
const EnhancedPriceMonitor = require('./monitor/enhancedMonitor');
const AlertService = require('./alert/alertService');
const { calculateArbitrageProfit, getGasPriceUSD } = require('./utils/helpers');

// 全局变量
let monitor = null;
let alertService = null;
let startTime = Date.now();

// 初始化 DEX 适配器
const dexAdapters = [];

// 添加 Binance 作为价格源
dexAdapters.push(new BinanceAdapter({ name: 'Binance' }));

// 添加 OKX 作为价格源
dexAdapters.push(new OKXAdapter({ name: 'OKX' }));

if (config.dexes) {
  for (const dexConfig of config.dexes) {
    if (dexConfig.name === 'uniswap') {
      dexAdapters.push(new UniswapAdapter(dexConfig));
    } else if (dexConfig.name === 'sushiswap') {
      dexAdapters.push(new SushiSwapAdapter(dexConfig));
    }
  }
}

// 初始化提醒服务
alertService = new AlertService(config.alerts);

console.log(`
╔════════════════════════════════════════╗
║     🤖 DeFi 套利机器人 v1.2          ║
╠════════════════════════════════════════╣
║  监控 DEX: ${dexAdapters.map(d => d.name).join(', ').padEnd(26)}║
║  监控代币: ${Object.keys(config.tokens).join(', ').padEnd(26)}║
║  监控间隔: ${config.monitor.interval + 'ms'.padEnd(26)}║
║  最小利润: $${config.monitor.minProfitUSD.toString().padEnd(25)}║
╚════════════════════════════════════════╝
`);

// 创建增强版价格监控器
monitor = new EnhancedPriceMonitor(dexAdapters, config, alertService);

// 启动
monitor.start();

// 定期报告系统状态
setInterval(() => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const prices = monitor.getPrices();
  
  console.log(`\n📊 [${new Date().toLocaleTimeString()}] 系统运行中... (${uptime}s)`);
  console.log('💰 当前价格:');
  
  for (const [token, dexPrices] of Object.entries(prices)) {
    const pricesStr = Object.entries(dexPrices)
      .map(([dex, price]) => `${dex}: $${price.toFixed(4)}`)
      .join(' | ');
    console.log(`   ${token}: ${pricesStr}`);
  }
}, 60000); // 每分钟报告一次

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭...');
  if (monitor) monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭...');
  if (monitor) monitor.stop();
  process.exit(0);
});

// 导出供测试使用
module.exports = { monitor, alertService, dexAdapters };
