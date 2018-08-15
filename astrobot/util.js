
import iconv from 'iconv-lite';

export function euckrToUtf8(euckrStream) {
  return new Promise((resolve, reject) => {
    euckrStream
    .pipe(iconv.decodeStream('euckr'))
    .collect(function (err, body) {
      if (err) reject(err);
      return resolve(body);
    });
  })
}