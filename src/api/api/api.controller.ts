import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiParam, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Agent } from 'https';
import axios from 'axios';
import { load } from 'cheerio';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Base } from 'src/base.controller';

@Controller()
export class ApiController extends Base {
  @Get('api?:name')
  //  api文档中的接口描述
  @ApiOperation({
    summary: 'github 日历表',
    description: readFileSync(join(__dirname, '../public/md/githubcalendar.md'), 'utf-8')
  })
  // api文档中的标签
  @ApiTags('github API')
  // api文档中的参数
  @ApiParam({
    name: 'name',
    required: true,
    description: 'github 用户名',
    example: 'kongxiangyiren',
    type: String
  })
  // 成功返回
  @ApiOkResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: '总提交次数'
        },
        contributions: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: '日期'
                },
                count: {
                  type: 'number',
                  description: '当天提交次数'
                }
              }
            }
          },
          description: '提交次数'
        },
        code: {
          type: 'number',
          description: '状态码'
        },
        msg: {
          type: 'string',
          description: '状态信息',
          example: 'ok'
        }
      }
    }
  })
  // 失败返回
  @ApiResponse({
    status: 201,
    description: '失败',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '状态码',
          example: 201
        },
        msg: {
          type: 'string',
          description: '失败返回信息'
        }
      }
    }
  })
  async getGithub(@Req() req: Request) {
    //  如果没有传入参数
    if (Object.keys(req.query).length === 0) {
      return this.fail(201, '无法获取到用户名');
    }
    const user = Object.keys(req.query)[0];
    // 获取缓存
    const data = await this.cache(`githubcalendar:${user}`);
    //  存在就返回缓存数据
    if (data) {
      return data;
    }
    // 请求github获取数据
    const data2 = await this.getdata(user);
    // 如果获取成功 就缓存10分钟
    if (data2.code === 0) {
      await this.cache(`githubcalendar:${user}`, data2, 10 * 60 * 1000);
    }
    // 返回结果
    return data2;
  }

  // 获取github数据
  async getdata(name: string) {
    // 忽略证书 本地开了代理时使用
    const agent = new Agent({
      rejectUnauthorized: false
    });

    // 请求github
    const { data: res } = await axios
      .get(`https://github.com/users/${name}/contributions`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          referer: `https://github.com/${name}`,
          'x-requested-with': 'XMLHttpRequest',
          // 伪造登录状态（？），否则 GitHub 不尊重时区
          cookie: 'logged_in=yes; tz=Asia%2FShanghai '
        },
        httpsAgent: agent,
        // 设置超时时间 20s
        timeout: 20000
      })
      .catch((err) => err);

    // 判断有没有获取成功
    if (!res) {
      // 失败返回
      return {
        total: 0,
        contributions: [],
        code: 201,
        msg: '请求失败'
      };
    }
    // 解析页面数据
    const $ = load(res);
    const data = $(
      'body > div > div:nth-child(1) > div > div > div:nth-child(1) > table > tbody > tr'
    );
    const contributions = [];
    let total = 0;
    for (const item of data) {
      const data2 = $(item).children('td');
      for (const item2 of data2) {
        const githubcalendarId = $(item2).attr('id');
        if (githubcalendarId) {
          let count: string | number = $(`tool-tip[for="${githubcalendarId}"]`)
            .text()
            .replace(/^(.*) contribution(.*)$/, '$1');
          count = count === 'No' ? 0 : Number(count);
          if (!isNaN(count) && $(item2).attr('data-date')) {
            total += count;
            contributions.push({
              date: $(item2).attr('data-date'),
              count
            });
          }
        }
      }
    }

    const sortedData = contributions.sort((a, b) => {
      const dateA = +new Date(a.date);
      const dateB = +new Date(b.date);
      return dateA - dateB;
    });

    // 成功返回
    return {
      total,
      contributions: this.listSplit(sortedData, 7),
      code: 0,
      msg: 'ok'
    };
  }

  // 获取的内容分组
  listSplit(items: string | any[], n: number) {
    const result = [];
    for (let i = 0, len = items.length; i < len; i += n) {
      result.push(items.slice(i, i + n));
    }
    return result;
  }
}
