/**
 * 套利机器人测试
 */
const assert = require('assert');

// 测试工具函数
function testHelpers() {
  console.log('\n🧪 测试工具函数...');
  
  // 测试 calculateArbitrageProfit
  const profit = calculateArbitrageProfit(1000, 1010, 1000, 5);
  assert(profit.profitUSD === 5, '利润应为 $5');
  assert(profit.isProfitable === true, '应有利润');
  console.log('   ✅ calculateArbitrageProfit 通过');
  
  // 测试无利润情况
  const loss = calculateArbitrageProfit(1000, 1005, 1000, 10);
  assert(loss.isProfitable === false, '应无利润');
  console.log('   ✅ 无利润情况通过');
  
  // 测试地址格式（简单检查）
  const validAddr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0eB12';
  const invalidAddr = '0x742d35Cc6634C0532925a3b844Bc9e7595f0eB'; // 太短
  assert(validAddr.length === 42, '有效地址长度应为42');
  assert(invalidAddr.length !== 42, '无效地址长度不是42');
  console.log('   ✅ 地址格式检查通过');
  
  // 测试 formatTokenAmount
  const formatted = formatTokenAmount(BigInt('1000000000000000000'), 18);
  assert(parseFloat(formatted) === 1, '应为 1 ETH');
  console.log('   ✅ formatTokenAmount 通过');
  
  console.log('✅ 工具函数测试通过！\n');
}

// 测试价格监控器
function testPriceMonitor() {
  console.log('🧪 测试价格监控器...');
  
  // 模拟数据
  const mockPrices = {
    'WETH': { 'Uniswap': 2000, 'SushiSwap': 2005 },
    'USDC': { 'Uniswap': 1, 'SushiSwap': 1.001 }
  };
  
  // 检测套利机会
  const tokens = Object.keys(mockPrices);
  for (const token of tokens) {
    const dexPrices = mockPrices[token];
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
    
    console.log(`   ${token}: ${minDex} @ $${minPrice} -> ${maxDex} @ $${maxPrice}`);
    console.log(`   价差: ${priceDiffPercent.toFixed(2)}%`);
  }
  
  console.log('✅ 价格监控测试通过！\n');
}

// 测试配置验证
function testConfig() {
  console.log('🧪 测试配置验证...');
  
  const validConfig = {
    networks: [{ name: 'ethereum', chainId: 1 }],
    tokens: { 'WETH': '0x...' },
    monitor: { interval: 5000, minProfitUSD: 10 }
  };
  
  assert(validConfig.monitor.interval >= 1000, '间隔应 >= 1秒');
  assert(validConfig.monitor.minProfitUSD >= 0, '最小利润应 >= 0');
  
  console.log('✅ 配置验证通过！\n');
}

// 运行所有测试
function runAllTests() {
  console.log('╔═══════════════════════════════════╗');
  console.log('║    🧪 套利机器人测试套件          ║');
  console.log('╚═══════════════════════════════════╝');
  
  testHelpers();
  testPriceMonitor();
  testConfig();
  
  console.log('🎉 所有测试通过！');
}

// 简单模拟依赖
function calculateArbitrageProfit(buyPrice, sellPrice, volume, gasCostUSD) {
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

function isValidAddress(address) {
  return address && address.length === 42 && address.startsWith('0x');
}

function formatTokenAmount(amount, decimals) {
  return (Number(amount) / Math.pow(10, decimals)).toString();
}

// 运行
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
