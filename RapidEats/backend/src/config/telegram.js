const TelegramBot = require('node-telegram-bot-api');

let bot = null;

const initTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  Telegram bot token not configured');
    return null;
  }

  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('✅ Telegram bot initialized');
    return bot;
  } catch (error) {
    console.error('❌ Error initializing Telegram bot:', error.message);
    return null;
  }
};

const getBot = () => {
  if (!bot) {
    bot = initTelegramBot();
  }
  return bot;
};

module.exports = { initTelegramBot, getBot };
