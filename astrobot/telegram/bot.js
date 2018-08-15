
import path from 'path';
import fs from 'fs';

import TelegramBotApi from 'node-telegram-bot-api';
import consola from 'consola';
import mime from 'mime';

import * as config from '../../config';
import BuildPlugins from '../plugins/plugins';

export default class TelegramBot {

  static SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

  constructor(token) {
    this.token = token;
    this.initialized = false;

    this.plugins = BuildPlugins(this);
    this.handler = null;
    this.bot = null;
    this.data = {
      subscribers: [],
    };
  }

  _loadSubscribers() {
    try {
      const _subscribersJSON = fs.readFileSync(TelegramBot.SUBSCRIBERS_PATH);
      this.data.subscribers = JSON.parse(_subscribersJSON);
      consola.debug(`subscribers = ${_subscribersJSON}`);
    } catch (err) {
      consola.error(err);
      consola.warn('Load error; subscribers = []');
    }
  }

  _saveSubscribers() {
    fs.writeFileSync(TelegramBot.SUBSCRIBERS_PATH, JSON.stringify(this.data.subscribers));
  }

  _registerHandler(handlerCls) {
    if (!Array.isArray(handlerCls.routings)) {
      throw new Error('handlers must be an array.');
    }

    this.handler = new handlerCls(this);

    for (let [ listenerName, matchRe, func ] of handlerCls.routings) {
      this.bot[listenerName](matchRe, func.bind(this.handler));
    }
  }

  initialize(handlerCls) {
    this.initialized = true;

    this.bot = new TelegramBotApi(this.token, {polling: true});
    this._loadSubscribers();
    this._registerHandler(handlerCls);
  }

  stopPolling() {
    this.bot.stopPolling();

    // dump subscribers
    this._saveSubscribers();
  }

  async waitForMessage(from, timeout = 30000) {
    return new Promise((resolve, reject) => {
      // timeout
      if (timeout) {
        setTimeout(() => reject(new Error('timed out')), timeout);
      }

      this.bot.onText(/.*/, (msg, content) => {
        const chatId = msg.chat.id;
        if (chatId === from) {
          resolve(content[0]);
        }
      });
    });
  }

  get adminId() {
    if (!config.TELEGRAM_BOT_ADMIN_ID) throw new Error('no TELEGRAM_BOT_ADMIN_ID');
    return config.TELEGRAM_BOT_ADMIN_ID;
  }

  async sendTo(to, message) {
    if (!this.initialized) return console.log(message);
    return this.bot.sendMessage(to, message);
  }

  async sendImage(to, imagePathOrStream, caption) {
    if (!this.initialized) return console.log(imagePathOrStream);

    await this.bot.sendChatAction(to, 'upload_photo');
    return this.bot.sendPhoto(to, imagePathOrStream, {
      caption: caption,
    }, typeof imagePathOrStream === 'string' ? {
      filename: path.basename(imagePathOrStream),
      contentType: mime.getType(imagePathOrStream),
    } : undefined);
  }

  async broadcast(message) {
    if (!this.initialized) return console.log(message);

    return this.data.subscribers.map(subscriber => {
      return this.bot.sendMessage(subscriber, message);
    });
  }

}
