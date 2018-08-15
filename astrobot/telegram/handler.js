
import _ from 'lodash';
import consola from 'consola';
import TelegramBot from './bot';
import KmaPlugin from '../plugins/kma/kma';

class Handler {
  static routings = [];

  static onText(match) {
    return function (target, name, descriptor) {
      const { value } = descriptor;
      // for (let [ listenerName, matchRe, func ] of Handler._handlers)
      target.constructor.routings.push(['onText', match, value]);
    };
  }
}


export default class TelegramHandler extends Handler {

  /**
   * @type {TelegramBot}
   */
  bot = null;

  constructor(bot) {
    super();
    this.bot = bot;
  }

  get data() {
    return this.bot.data;
  }

  @Handler.onText(/\/subscribe$/)
  onSubscribe({ chat }) {
    this.data.subscribers = _.union(this.data.subscribers, [ chat.id ]);
    consola.info(`${chat.id} subscribed`);
    this.bot.sendTo(chat.id, 'subscribed.');
  }

  @Handler.onText(/\/unsubscribe/)
  onUnsubscribe({ chat }) {

    _.remove(this.data.subscribers, s => s === chat.id);

    consola.info(`${chat.id} unsubscribed`);
    this.bot.sendTo(chat.id, 'unsubscribed.');
  }

  @Handler.onText(/\/ping/)
  onPing({ chat }) {
    this.bot.sendTo(chat.id, 'pong');
  }

  @Handler.onText(/\/kmasat/)
  onKmaSatRequest({ chat }) {
    this.bot.plugins[KmaPlugin.pluginName].onSateliteImageRequest(chat.id);
  }

  /**
   * admin features
   */
  @Handler.onText(/\/subscriberscount/)
  onSubscribersCount({ chat }) {
    this.bot.sendTo(chat.id, this.data.subscribers.length);
  }

  @Handler.onText(/\/announce (.+)/)
  onAnnouncement({ chat }, content) {
    if (!content) {
      return this.bot.sendTo(chat.id, '/announce {{content}}');
    }

    for (let subscriber of this.data.subscribers) {
      this.bot.sendTo(subscriber, content);
    }

    this.bot.sendTo(chat.id, 'broadcasted.');
  }
}
