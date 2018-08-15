import TelegramBot from './telegram/bot';
import TelegramHandler from './telegram/handler';

import * as config from '../config';

export async function run() {
  const telegramBot = new TelegramBot(config.TELEGRAM_BOT_TOKEN);
  telegramBot.initialize(TelegramHandler);
}