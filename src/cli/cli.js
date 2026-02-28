/**
 * CLI 交互界面
 */
const readline = require('readline');

class CLI {
  constructor(monitor, executor = null) {
    this.monitor = monitor;
    this.executor = executor;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.isRunning = false;
  }

  /**
   * 启动 CLI
   */
  start() {
    this.isRunning = true;
    console.log(`
╔════════════════════════════════════════╗
║     🤖 DeFi 套利机器人 CLI          ║
╠════════════════════════════════════════╣
║  输入 help 查看可用命令              ║
╚════════════════════════════════════════╝
    `);
    
    this.rl.on('line', (line) => {
      this.handleCommand(line.trim());
    });
  }

  /**
   * 处理命令
   */
  handleCommand(cmd) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
      case 'h':
        this.showHelp();
        break;
      case 'status':
      case 's':
        this.showStatus();
        break;
      case 'prices':
      case 'p':
        this.showPrices();
        break;
      case 'history':
      case 'hist':
        this.showHistory(args);
        break;
      case 'start':
        this.startArbitrage();
        break;
      case 'stop':
        this.stopArbitrage();
        break;
      case 'clear':
        console.clear();
        break;
      case 'quit':
      case 'exit':
        this.exit();
        break;
      default:
        console.log(`❌ 未知命令: ${command}`);
        console.log('   输入 help 查看可用命令');
    }
    
    this.prompt();
  }

  /**
   * 显示帮助
   */
  showHelp() {
    console.log(`
📖 可用命令:

  help (h)          - 显示帮助
  status (s)        - 显示系统状态
  prices (p)        - 显示当前价格
  history [n] (hist) - 显示最近 n 条套利记录
  start             - 开始监控
  stop              - 停止监控
  clear             - 清屏
  quit (exit)       - 退出
    `);
  }

  /**
   * 显示状态
   */
  showStatus() {
    if (!this.monitor) {
      console.log('❌ 监控器未初始化');
      return;
    }
    
    const stats = this.monitor.getStats();
    console.log(`
📊 系统状态:

  运行时间:    ${stats.uptime}
  总请求数:    ${stats.requests}
  发现套利:    ${stats.arbitrageFound}
  盈利交易:    ${stats.profitableTrades}
  总利润:      $${stats.totalProfitUSD}
  错误率:      ${stats.errorRate}
  执行时间:    ${stats.avgExecutionTime}ms
    `);
  }

  /**
   * 显示价格
   */
  showPrices() {
    if (!this.monitor) {
      console.log('❌ 监控器未初始化');
      return;
    }
    
    const prices = this.monitor.getPrices();
    console.log('\n💰 当前价格:\n');
    
    for (const [token, dexPrices] of Object.entries(prices)) {
      console.log(`  ${token}:`);
      for (const [dex, price] of Object.entries(dexPrices)) {
        console.log(`    ${dex}: $${price.toFixed(4)}`);
      }
    }
    console.log('');
  }

  /**
   * 显示历史
   */
  showHistory(args) {
    if (!this.monitor) {
      console.log('❌ 监控器未初始化');
      return;
    }
    
    const limit = parseInt(args[0]) || 10;
    const history = this.monitor.getHistory().slice(-limit);
    
    console.log(`\n📜 最近 ${history.length} 条套利记录:\n`);
    
    history.forEach((item, i) => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      const emoji = item.isProfitable ? '✅' : '❌';
      console.log(`  ${i + 1}. ${time} ${emoji}`);
      console.log(`     ${item.token}: ${item.buyDex} $${item.buyPrice} -> ${item.sellDex} $${item.sellPrice}`);
      console.log(`     利润: $${item.profitUSD.toFixed(2)}`);
    });
    console.log('');
  }

  /**
   * 开始监控
   */
  startArbitrage() {
    console.log('▶️  开始监控...');
  }

  /**
   * 停止监控
   */
  stopArbitrage() {
    console.log('⏹️  停止监控...');
  }

  /**
   * 退出
   */
  exit() {
    console.log('👋 再见!');
    this.isRunning = false;
    this.rl.close();
    process.exit(0);
  }

  /**
   * 显示提示符
   */
  prompt() {
    if (this.isRunning) {
      this.rl.question('> ', (answer) => {
        this.handleCommand(answer);
      });
    }
  }
}

module.exports = CLI;
