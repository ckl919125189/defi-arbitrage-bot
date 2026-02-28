/**
 * 工具函数
 */
const ethers = require('ethers');

/**
 * 获取当前 Gas 价格（美元）
 */
async function getGasPriceUSD(network = 'ethereum') {
  const gasPrices = {
    ethereum: { fast: 30, normal: 20, slow: 10 }, // Gwei
    arbitrum: { fast: 0.1, normal: 0.05, slow: 0.01 },
    polygon: fast: 50, normal: 30, slow: 20
  };
  
  const prices = gasPrices[network] || gasPrices.ethereum;
  return prices;
}

/**
 * 计算交易 Gas 成本（USD）
 */
function calculateGasCost(gasLimit, gasPriceGwei, ethPriceUSD) {
  const gasCostETH = ethers.formatEther(gasLimit * BigInt(Math.floor(gasPriceGwei * 1e9)));
  return parseFloat(gasCostETH) * ethPriceUSD;
}

/**
 * 计算套利利润
 */
function calculateArbitrageProfit(buyPrice, sellPrice, amount, gasCostUSD) {
  const buyCost = amount * buyPrice;
  const sellRevenue = amount * sellPrice;
  const profit = sellRevenue - buyCost - gasCostUSD;
  const profitPercent = ((sellRevenue - buyCost) / buyCost) * 100;
  
  return {
    profitUSD: profit,
    profitPercent,
    buyCost: buyCost,
    sellRevenue: sellRevenue,
    gasCost: gasCostUSD,
    isProfitable: profit > 0
  };
}

/**
 * 格式化代币数量
 */
function formatTokenAmount(amount, decimals = 18) {
  return ethers.formatUnits(amount, decimals);
}

/**
 * 解析代币数量
 */
function parseTokenAmount(amount, decimals = 18) {
  return ethers.parseUnits(amount.toString(), decimals);
}

/**
 * 验证以太坊地址
 */
function isValidAddress(address) {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机 ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

module.exports = {
  getGasPriceUSD,
  calculateGasCost,
  calculateArbitrageProfit,
  formatTokenAmount,
  parseTokenAmount,
  isValidAddress,
  delay,
  generateId
};
