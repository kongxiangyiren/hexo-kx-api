import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class Base {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /** 失败返回 */
  fail(errno: number, errmsg?: string, data?: any) {
    return {
      code: errno,
      msg: errmsg,
      data
    };
  }

  /** 成功返回 */
  success(data: any, errmsg?: string) {
    return {
      data,
      code: 0,
      msg: errmsg || 'ok'
    };
  }

  /** 缓存 */
  async cache<T>(name: string, value?: T, config?: number) {
    if (value === undefined) {
      return await this.cacheManager.get(name);
    } else if (value === null) {
      return await this.cacheManager.del(name);
    } else if (value !== undefined && config !== undefined) {
      return await this.cacheManager.set(name, value, config);
    } else {
      return await this.cacheManager.set(name, value);
    }
  }
}
