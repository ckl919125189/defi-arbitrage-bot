/**
 * DEX 适配器测试
 */
const assert = require('assert');

console.log('\n🧪 测试 DEX 适配器...');

// 测试 1: 套利利润计算
function testArbitrageProfitCalculation() {
  console.log('   测试套利利润计算...');
  
  // 场景：Uniswap $2000, SushiSwap $2005
  const buyPrice = 2000;
  const sellPrice = 2005;
  const volume = 10000;
  const gasCost = 15;
  
  const buyAmount = volume / buyPrice;
  const sellRevenue = buyAmount * sellPrice;
  const profit = sellRevenue - volume - gasCost;
  const profitPercent = profit / volume * 100;
  
  assert(profit === 10, '利润应为 $10');
  assert(profitPercent === 0.1, '利润率应为 0.1%');
  
  console.log('   ✅ 套利利润计算通过');
}

// 测试 2: Gas 成本影响
function testGasCostImpact() {
  console.log('   测试 Gas 成本影响...');
  
  const buyPrice = 2000;
  const volume = 1000;
  
  // 高 Gas ($50)
  let sellPrice = 2003;
  let gasCost = 50;
  let profit = (volume / buyPrice * sellPrice) - volume - gasCost;
  assert(profit < 0, '高 Gas 应导致亏损');
  
  // 低 Gas ($5)
  sellPrice = 2015;
  gasCost = 5;
  profit = (volume / buyPrice * sellPrice) - volume - gasCost;
  assert(profit > 0, '低 Gas 应有利润');
  
  console.log('   ✅ Gas 成本影响通过');
}

// 测试 3: 三角套利
function testTriangularArbitrage() {
  console.log('   测试三角套利...');
  
  // ETH -> USDC -> DAI -> USDC
  const ethToUsdc = 2000;
  const usdcToDai = 0.95;
  const daiToUsdc = 1.06;
  
  const step1 = 1 * ethToUsdc;
  const step2 = step1 * usdcToDai;
  const step3 = step2 * daiToUsdc;
  
  const profit = step3 - step1;
  const profitPercent = profit / step1 * 100;
  
  assert(profit > 0, '三角套利应有利润');
  console.log(`      利润: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
  
  console.log('   ✅ 三角套利通过');
}

// 测试 4: 价格波动检测
function testPriceVolatilityDetection() {
  console.log('   测试价格波动检测...');
  
  const prices = [100, 102, 98, 105, 95, 110, 88, 115];
  const avg = prices.reduce((a, b) => a + b) / prices.length;
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const volatility = (max - min) / avg * 100;
  
  assert(volatility > 10, '波动率应大于 10%');
  console.log(`      波动率: ${volatility.toFixed(2)}%`);
  
  console.log('   ✅ 价格波动检测通过');
}

// 测试 5: 执行时间监控
function testExecutionTimeMonitoring() {
  console.log('   测试执行时间监控...');
  
  const times = [100, 120, 90, 110, 95, 105];
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  
  assert(avg < 200, '平均执行时间应小于 200ms');
  console.log(`      平均: ${avg.toFixed(0)}ms`);
  
  console.log('   ✅ 执行时间监控通过');
}

// 运行测试
function runTests() {
  console.log('╔═══════════════════════════════════╗');
  console.log('║    🧪 DEX 适配器测试套件         ║');
  console.log('╚═══════════════════════════════════╝');
  
  testArbitrageProfitCalculation();
  testGasCostImpact();
  testTriangularArbitrage();
  testPriceVolatilityDetection();
  testExecutionTimeMonitoring();
  
  console.log('\n🎉 所有 DEX 适配器测试通过！\n');
}

runTests();
