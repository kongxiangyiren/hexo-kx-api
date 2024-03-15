import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Base ,ROOT_PATH} from 'src/base.controller';

@Controller('api')
export class DjtController extends Base {
  @Get('djt')
  @ApiOperation({ summary: '毒鸡汤' })
  //   api文档中的标签
  @ApiTags('毒鸡汤 API')
  // 成功返回
  @ApiOkResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: '毒鸡汤内容',
          example: '最近一个月，总有那么三十天很不顺。',
        },
        msg: {
          type: 'string',
          description: '状态信息',
          example: 'ok',
        },
        code: {
          type: 'number',
          description: '状态码',
          example: 0,
        },
      },
    },
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
          example: 201,
        },
        msg: {
          type: 'string',
          description: '失败返回信息',
          example: '数据库错误',
        },
      },
    },
  })
  // 500错误返回
  @ApiResponse({
    status: 500,
    description: '服务器错误',
  })
  getDjt() {
    // https://github.com/able8/nows-nodejs-serverless
    const djtPath = join(ROOT_PATH, '/public/data/毒鸡汤.txt');
    if (!existsSync(djtPath)) {
      return this.fail(201, '数据库错误');
    }
    const data = readFileSync(djtPath, 'utf-8');
    const lines = data.replace(/\r/g, '').split('\n');
    const filteredArr = lines.filter((item) => item.trim() !== ''); // 过滤掉空字符串
    const n = Math.floor(Math.random() * filteredArr.length);
    return this.success(filteredArr[n], 'ok');
  }
}
