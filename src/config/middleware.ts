import * as morgan from 'morgan';
import { day } from './plugin';
import {
  bgBlue,
  bgCyan,
  bgGreen,
  bgLightGray,
  bgMagenta,
  bgRed,
  black,
  green,
  trueColorBg,
  white
} from 'kolorist';
// 自定义时间格式
morgan.token('date', function getDateToken(req, res, arg) {
  return day(Date.now()).format(typeof arg === 'string' ? arg : 'YYYY/MM/DD - HH:mm:ss');
});

// 自定义 状态码
morgan.token('status', function (req, res) {
  // if (process.env.NODE_ENV !== 'development') {
  //   return ` ${res.statusCode} `;
  // }

  if (
    (res.statusCode >= 100 && res.statusCode <= 199) ||
    (res.statusCode >= 500 && res.statusCode <= 599)
  ) {
    return bgRed(white(` ${res.statusCode} `));
  } else if (res.statusCode >= 200 && res.statusCode <= 299) {
    return bgGreen(white(` ${res.statusCode} `));
  } else if (res.statusCode >= 300 && res.statusCode <= 399) {
    return bgLightGray(black(` ${res.statusCode} `));
  } else if (res.statusCode >= 400 && res.statusCode <= 499) {
    return trueColorBg(181, 137, 0)(white(` ${res.statusCode} `));
  }

  return ` ${res.statusCode} `;
});

// 请求方法
morgan.token('method', function (req, res) {
  const method = ` ${req.method} ` + ' '.repeat(10 - ` ${req.method} `.length);
  // if (process.env.NODE_ENV !== 'development') {
  //   return method;
  // }
  switch (req.method) {
    case 'GET':
      return bgBlue(white(method));
    case 'POST':
      return bgCyan(white(method));
    case 'PUT':
      return trueColorBg(181, 137, 0)(white(method));
    case 'DELETE':
      return bgRed(white(method));
    case 'OPTIONS':
      return bgLightGray(white(method));
    case 'HEAD':
      return bgMagenta(white(method));
    case 'PATCH':
      return bgGreen(white(method));
    default:
      return method;
  }
});

morgan.token('pid', function (req, res) {

  return green(`[Nest] ${process.pid}  -`);
});
morgan.format(
  'ginStyle',
  ':pid :date[YYYY/MM/DD HH:mm:ss] |:status| :response-time ms | :remote-addr |:method ":url"'
);

export const morganMiddleware = morgan('ginStyle');
