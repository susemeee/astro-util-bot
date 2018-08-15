
import KmaPlugin from './kma/kma';
import TelegramBot from '../telegram/bot';
import BasePlugin from './base';

/**
 * @param {TelegramBot} bot
 * @returns {Object<String, BasePlugin>}
 */
export default function buildPlugins(bot) {
  return {
    [KmaPlugin.pluginName]: new KmaPlugin(bot),
  }
};