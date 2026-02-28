# 🤖 DeFi 套利机器人

> 实时监控多 DEX 价格，发现套利机会 📈

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Tests](https://img.shields.io/badge/Tests-100%25-brightgreen)

## ✨ 功能特性

- 🔄 **多 DEX 价格监控** - Uniswap, SushiSwap 等主流 DEX
- 📊 **实时价差检测** - 跨DEX价格对比，发现套利机会
- 📈 **套利利润计算** - 扣除Gas后的净利润估算
- 🔔 **多渠道提醒** - Telegram, 控制台
- 🧪 **完整测试** - 单元测试覆盖

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/ckl919125189/defi-arbitrage-bot.git
cd defi-arbitrage-bot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置

```bash
cp config.example.json config.json
```

编辑 `config.json`：

```json
{
  "networks": [
    {
      "name": "ethereum",
      "chainId": 1,
      "rpc": "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
    }
  ],
  "dexes": [
    { "name": "uniswap", "factory": "0x..." },
    { "name": "sushiswap", "factory": "0x..." }
  ],
  "tokens": {
    "WETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  },
  "monitor": {
    "interval": 5000,
    "minProfitUSD": 10
  },
  "alerts": {
    "console": { "enabled": true },
    "telegram": {
      "enabled": false,
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID"
    }
  }
}
```

### 4. 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 5. 测试

```bash
npm test
```

## 📁 项目结构

```
defi-arbitrage-bot/
├── src/
│   ├── index.js              # 主入口
│   ├── dex/
│   │   ├── uniswap.js        # Uniswap 适配器
│   │   └── sushiswap.js      # SushiSwap 适配器
│   ├── monitor/
│   │   └── priceMonitor.js   # 价格监控器
│   ├── alert/
│   │   └── alertService.js   # 提醒服务
│   └── utils/
│       └── helpers.js        # 工具函数
├── tests/
│   └── bot.test.js          # 测试用例
├── config.example.json       # 配置示例
├── package.json
└── README.md
```

## ⚙️ 配置说明

### 网络配置

| 参数 | 说明 | 示例 |
|------|------|------|
| name | 网络名称 | ethereum, arbitrum, polygon |
| chainId | Chain ID | 1, 42161, 137 |
| RPC | RPC 节点 URL | Alchemy/Infura URL |

### 监控配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| interval | 监控间隔(毫秒) | 5000 |
| minProfitUSD | 最小利润(USD) | 10 |
| gasPriceMultiplier | Gas 价格倍数 | 1.2 |

### 提醒配置

```json
"alerts": {
  "telegram": {
    "enabled": true,
    "botToken": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
    "chatId": "123456789"
  }
}
```

## 🔧 获取 Telegram Bot Token

1. 打开 Telegram
2. 搜索 @BotFather
3. 发送 `/newbot` 创建新机器人
4. 获取 Bot Token

## 🧪 测试结果

```
╔═══════════════════════════════════╗
║    🧪 套利机器人测试套件          ║
╚═══════════════════════════════════╝

🧪 测试工具函数...
   ✅ calculateArbitrageProfit 通过
   ✅ 无利润情况通过
   ✅ 地址格式检查通过
   ✅ formatTokenAmount 通过
✅ 工具函数测试通过！

🧪 测试价格监控器...
   WETH: Uniswap @ $2000 -> SushiSwap @ $2005
   价差: 0.25%
✅ 价格监控测试通过！

🧪 测试配置验证...
✅ 配置验证通过！

🎉 所有测试通过！
```

## 📊 支持的 DEX

| DEX | 网络 | 状态 |
|-----|------|------|
| Uniswap V3 | Ethereum, Arbitrum, Optimism | ✅ |
| SushiSwap | Multi-chain | ✅ |
| Curve | Ethereum | 🔜 |

## 💰 收入方式

1. **🟢 可行方式**
   - 卖工具订阅（$19-99/月）
   - 提供套利信号服务
   - 帮用户执行交易抽成

2. **⚠️ 风险提醒**
   - 自动交易需要大量资金
   - Gas 波动影响利润
   - MEV 机器人竞争激烈

## 🔜 后续功能

- [ ] 自动交易执行
- [ ] 三角套利
- [ ] 更多 DEX 支持 (Curve, Balancer)
- [ ] Web 仪表盘
- [ ] 历史数据分析

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

Made with ❤️ by [阿Ken]
