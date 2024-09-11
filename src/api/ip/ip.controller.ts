import { Controller, Get, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { isIP } from 'net';
import { Base } from 'src/base.controller';
import { IP2Location } from 'ip2location-nodejs';
import { join } from 'path';

import * as IpCn from '../../../public/data/ip-cn.json';
import { readFileSync } from 'fs';

@Controller('api')
export class IpController extends Base {
  @Get('ip')
  @ApiOperation({
    summary: '获取ip信息',
    description: readFileSync(join(__dirname, '../public/md/ip.md'), 'utf-8')
  })
  //   api文档中的标签
  @ApiTags('ip API')
  // query参数
  @ApiQuery({
    name: 'ip',
    required: false,
    description: 'ip地址',
    type: String,
    example: '223.5.5.5'
  })
  // 返回的状态码
  @ApiOkResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '状态码',
          example: 0
        },
        message: {
          type: 'string',
          description: '数据库来源说明',
          example: '此站点或产品所使用的 IP2Location LITE 数据来自于 https://lite.ip2location.com'
        },
        msg: {
          type: 'string',
          description: '状态信息',
          example: 'OK'
        },
        result: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              description: 'ip地址',
              example: '8.8.8.8'
            },
            location: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: '纬度',
                  example: 37.386051
                },
                lng: {
                  type: 'number',
                  description: '经度',
                  example: -122.083847
                }
              }
            },
            ad_info: {
              type: 'object',
              properties: {
                nation: {
                  type: 'string',
                  description: '国家',
                  example: '美国'
                },
                province: {
                  type: 'string',
                  description: '省份',
                  example: 'California'
                },
                city: {
                  type: 'string',
                  description: '城市',
                  example: 'Mountain View'
                },
                district: {
                  type: 'string',
                  description: '区县',
                  example: ''
                }
              }
            }
          }
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
          description: '失败返回信息',
          example: '无法获取有效IP'
        }
      }
    }
  })
  getIp(@Req() req: Request) {
    const ip = req.query.ip
      ? req.query.ip
      : req.header['CF-Connecting-IP']
        ? req.header['CF-Connecting-IP']
        : req.ip;

    // 判断是否是ip
    if (!isIP(ip)) {
      return this.fail(201, '无法获取有效IP');
    }
    const ip2location = new IP2Location();
    // 每月更新 https://lite.ip2location.com/database/db5-ip-country-region-city-latitude-longitude?lang=zh_CN
    // 下载ipv6的bin文件
    ip2location.open(join(__dirname, '../public/data/IP2LOCATION-LITE-DB5.IPV6.BIN'));
    const data = ip2location.getAll(ip);

    data.countryLong = this.gj(data.countryShort)[0] ? this.gj(data.countryShort)[0].cn : '';
    if (data.countryShort === 'CN') {
      data.region = this.cityTochinese(data.region)[0].name;
      data.city = this.cityTochinese(data.city, data.region)[0].name;
    }
    ip2location.close();
    return {
      code: 0,
      message: '此站点或产品所使用的 IP2Location LITE 数据来自于 https://lite.ip2location.com',
      msg: 'OK',
      result: {
        ip,
        location: {
          lat: data.latitude,
          lng: data.longitude
        },
        ad_info: {
          nation: data.countryLong === '-' ? '' : data.countryLong,
          province: data.region === '-' ? '' : data.region,
          city: data.city === '-' ? '' : data.city,
          district: ''
        }
      }
    };
  }

  cityTochinese(name: string, regionChinese?: string) {
    return IpCn.中国城市.filter((item: { merger_name: string; pinyin: string }) => {
      return regionChinese
        ? item.merger_name.includes(regionChinese) && item.pinyin.includes(name.toLowerCase())
        : item.pinyin.includes(name.toLowerCase());
    });
  }

  gj(name: string) {
    return IpCn.国家.filter((item: { code: string }) => {
      return item.code.includes(name);
    });
  }
}
