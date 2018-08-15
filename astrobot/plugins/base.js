import TelegramBot from '../telegram/bot';
import KmaPlugin from './kma/kma';

export default class BasePlugin {

  /**
   * @type {TelegramBot}
   */
  bot = null;
  static pluginName = 'plugin';

  /**
   * @param {TelegramBot} bot
   */
  constructor(bot) {
    this.bot = bot;
  }

}