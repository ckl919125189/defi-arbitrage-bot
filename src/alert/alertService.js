/**
 * 提醒服务
 */
const TelegramBot = require('node-telegram-bot-api');

class AlertService {
  constructor(config) {
    this.config = config;
    this.telegramBot = null;
    this.consoleEnabled = config.console?.enabled ?? true;
    
    // 初始化 Telegram
    if (config.telegram?.enabled && config.telegram.botToken) {
      try {
        this.telegramBot = new TelegramBot(config.telegram.botToken, { polling: false });
        console.log('✅ Telegram 机器人已连接');
      } catch (error) {
        console.error('❌ Telegram 连接失败:', error.message);
      }
    }
  }

  /**
   * 发送套利机会提醒
   */
  async sendArbitrageAlert(data) {
    const message = this.formatArbitrageMessage(data);
    
    // 控制台输出
    if (this.consoleEnabled) {
      console.log('\n' + message);
    }
    
    // Telegram 发送
    if (this.telegramBot && this.config.telegram.chatId) {
      try {
        await this.telegramBot.sendMessage(
          this.config.telegram.chatId,
          message,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('❌ Telegram 发送失败:', error.message);
      }
    }
  }

  /**
   * 发送错误提醒
   */
  async sendErrorAlert(error, context = '') {
    const message = `
🚨 *错误警报*

*上下文:* ${context}
*错误:* ${error.message}
*时间:* ${new Date().toISOString()}
    `.trim();
    
    if (this.consoleEnabled) {
      console.error('\n' + message);
    }
    
    if (this.telegramBot && this.config.telegram.chatId) {
      try {
        await this.telegramBot.sendMessage(
          this.config.telegram.chatId,
          message,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('❌ Telegram 发送失败:', error.message);
      }
    }
  }

  /**
   * 发送系统状态
   */
  async sendSystemStatus(status) {
    const message = `
📊 *系统状态*

*状态:* ${status.running ? '🟢 运行中' : '🔴 已停止'}
*监控代币:* ${status.tokens || 0}
*监控 DEX:* ${status.dexes || 0}
*运行时间:* ${status.uptime || 0}s
    `.trim();
    
    if (this.consoleEnabled) {
      console.log('\n' + message);
    }
  }

  /**
   * 格式化套利消息
   */
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

    const emoji = isProfitable ? '🟢' : '⚠️';
    
    return `
${emoji} *套利机会！*

*代币:* ${token}
*交易量:* $${volume.toLocaleString()}
━━━━━━━━━━━━━━
*买入:* ${buyDex} @ $${buyPrice.toFixed(4)}
*卖出:* ${sellDex} @ $${sellPrice.toFixed(4)}
*价差:* $${priceDiff.toFixed(2)} (${priceDiffPercent.toFixed(2)}%)
━━━━━━━━━━━━━━
*Gas 成本:* $${gasCost.toFixed(2)}
*预估利润:* $${profitUSD.toFixed(2)}
*状态:* ${isProfitable ? '✅ 可执行' : '❌ 利润为负'}
    `.trim();
  }
}

module.exports = AlertService;
