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
const PriceMonitor = require('./monitor/priceMonitor');

// 初始化 DEX 适配器
const dexAdapters = [];

if (config.dexes) {
  for (const dexConfig of config.dexes) {
    if (dexConfig.name === 'uniswap') {
      dexAdapters.push(new UniswapAdapter(dexConfig));
    } else if (dexConfig.name === 'sushiswap') {
      dexAdapters.push(new SushiSwapAdapter(dexConfig));
    }
  }
}

console.log(`
╔═══════════════════════════════════════╗
║     🤖 DeFi 套利机器人启动中...       ║
╠═══════════════════════════════════════╣
║  监控 DEX: ${dexAdapters.map(d => d.name).join(', ') || '未配置'}
║  监控代币: ${Object.keys(config.tokens).join(', ')}
║  监控间隔: ${config.monitor.interval}ms
║  最小利润: $${config.monitor.minProfitUSD}
╚═══════════════════════════════════════╝
`);

// 创建价格监控器
const monitor = new PriceMonitor(dexAdapters, config);

// 启动
monitor.start();

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭...');
  monitor.stop();
  process.exit(0);
});
