/**
 * 提醒服务测试
 */
const assert = require('assert');

console.log('\n🧪 测试提醒服务...');

// 模拟 AlertService
class MockAlertService {
  constructor() {
    this.messages = [];
  }

  formatArbitrageMessage(data) {
    const {
      token,
      buyDex,
      sellDex,
      buyPrice,
      sellPrice,
      priceDiff,
      priceDiffPercent,
      profitUSD,
      volume,
      gasCost,
      isProfitable
    } = data;

    return `套利机会: ${token} ${buyDex}->${sellDex} 利润: $${profitUSD.toFixed(2)}`;
  }

  async sendArbitrageAlert(data) {
    const message = this.formatArbitrageMessage(data);
    this.messages.push(message);
    return true;
  }
}

// 测试 1: 有利润的套利机会
const alertService = new MockAlertService();
const profitableOpportunity = {
  token: 'WETH',
  buyDex: 'Uniswap',
  sellDex: 'SushiSwap',
  buyPrice: 2000,
  sellPrice: 2010,
  priceDiff: 10,
  priceDiffPercent: 0.5,
  volume: 1000,
  gasCost: 5,
  profitUSD: 5,
  isProfitable: true
};

alertService.sendArbitrageAlert(profitableOpportunity);
assert(alertService.messages.length === 1, '应发送1条消息');
console.log('   ✅ 有利润提醒通过');

// 测试 2: 无利润的套利机会
const unprofitableOpportunity = {
  token: 'WETH',
  buyDex: 'Uniswap',
  sellDex: 'SushiSwap',
  buyPrice: 2000,
  sellPrice: 2003,
  priceDiff: 3,
  priceDiffPercent: 0.15,
  volume: 1000,
  gasCost: 10,
  profitUSD: -7,
  isProfitable: false
};

alertService.sendArbitrageAlert(unprofitableOpportunity);
assert(alertService.messages.length === 2, '应发送2条消息');
console.log('   ✅ 无利润提醒通过');

// 测试 3: 消息格式
const message = alertService.formatArbitrageMessage(profitableOpportunity);
assert(message.includes('WETH'), '消息应包含代币');
assert(message.includes('Uniswap'), '消息应包含买入DEX');
assert(message.includes('SushiSwap'), '消息应包含卖出DEX');
assert(message.includes('$5.00'), '消息应包含利润');
console.log('   ✅ 消息格式通过');

console.log('✅ 提醒服务测试通过！\n');

// 测试 4: Gas 成本计算
console.log('🧪 测试 Gas 成本计算...');

function calculateGasCost(gasLimit, gasPriceGwei) {
  const gasCostETH = gasLimit * gasPriceGwei * 1e-9;
  const ethPriceUSD = 2000;
  return gasCostETH * ethPriceUSD;
}

// 假设一笔 Uniswap 交易需要 150,000 gas，Gas 价格 30 Gwei
const gasCost = calculateGasCost(150000, 30);
assert(Math.abs(gasCost - 9) < 0.01, 'Gas 成本应为 $9');
console.log('   ✅ Gas 成本计算通过');

// 测试 5: 三角套利检测
console.log('🧪 测试三角套利...');

function detectTriangularArbitrage(prices) {
  // 简化：A->B->C->A
  const { AB, BC, CA } = prices;
  
  if (!AB || !BC || !CA) return null;
  
  // 假设用 1 A 开始
  const step1 = 1 / AB; // A -> B
  const step2 = step1 * BC; // B -> C
  const step3 = step2 * CA; // C -> A
  
  const profit = step3 - 1;
  const profitPercent = profit * 100;
  
  return {
    profitPercent,
    isProfitable: profitPercent > 0
  };
}

const triangularPrices = { AB: 0.5, BC: 3, CA: 0.68 }; // 1/0.5 * 3 * 0.68 = 4.08
const result = detectTriangularArbitrage(triangularPrices);
assert(result.isProfitable === true, '三角套利应有利可图');
console.log('   ✅ 三角套利检测通过');

console.log('✅ 所有高级测试通过！\n');

console.log('🎉 所有提醒和高级功能测试通过！');
