import BasePlugin from '../base';

import { DateTime } from 'luxon';
import axios from 'axios';
import cheerio from 'cheerio';
import consola from 'consola';

import { euckrToUtf8 } from '../../util';

export default class KmaPlugin extends BasePlugin {

  static pluginName = 'kmaplugin';

  async onSateliteImageRequest(fromId) {

    const HOST = 'http://www.weather.go.kr';
    const today = DateTime.local().toFormat('yyyy.LL.dd');
    const KMA_FETCH_URL = `${HOST}/weather/images/satellite_basic03.jsp?prevSat=le1b&sat=le1b&dtm=&area=k&data=swir&tm=${today}`;

    try {
      const response = await axios.get(KMA_FETCH_URL, {
        responseType: 'stream',
      });

      const $ = cheerio.load(await euckrToUtf8(response.data));

      const imgUrl = $('#slide-images > li:nth-child(8) > a').attr('href');

      const { data } = await axios({
        method: 'GET',
        url: `${HOST}${imgUrl}`,
        responseType: 'stream',
      });

      this.bot.sendImage(fromId, data);

    } catch (err) {
      consola.error(err);
      this.bot.sendTo(fromId, '에러 발생');
    }
  }

}