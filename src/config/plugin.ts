import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale('zh-cn');

dayjs.tz.setDefault('Asia/Shanghai');

export const day = dayjs;
