# 🤖 DeFi 套利机器人

> 实时监控多 DEX 价格，发现套利机会

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 功能特性

- 🔄 **多 DEX 价格监控** - Uniswap, SushiSwap, Curve
- 📊 **实时价差检测** - 跨DEX价格对比
- 📈 **套利机会计算** - 扣除Gas后的净利润估算
- 🔔 **多渠道提醒** - Telegram, Discord, Email
- 📱 **Web 仪表盘** - 实时查看数据

## 快速开始

### 安装

```bash
cd arbitrage-bot
npm install
```

### 配置

```bash
cp config.example.json config.json
# 编辑 config.json 添加你的配置
```

### 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 配置说明

```json
{
  "networks": ["ethereum", "arbitrum", "polygon"],
  "tokens": ["WETH", "USDC", "USDT", "DAI"],
  "dexes": ["uniswap", "sushiswap", "curve"],
  "minProfit": 10,
  "alerts": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID"
    }
  }
}
```

## 项目结构

```
arbitrage-bot/
├── src/
│   ├── config/          # 配置文件
│   ├── dex/              # DEX 适配器
│   │   ├── uniswap.js
│   │   ├── sushiswap.js
│   │   └── curve.js
│   ├── monitor/          # 价格监控
│   ├── alert/           # 提醒服务
│   ├── utils/           # 工具函数
│   └── index.js         # 入口文件
├── config.example.json   # 配置示例
├── package.json
└── README.md
```

## 支持的 DEX

| DEX | 网络 | 状态 |
|-----|------|------|
| Uniswap V3 | Ethereum, Arbitrum, Optimism | ✅ |
| SushiSwap | Multi-chain | ✅ |
| Curve | Ethereum | ✅ |

## 监控代币

默认监控：
- WETH / ETH
- USDC / USDT / DAI
- WBTC
- 其他主流代币

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
