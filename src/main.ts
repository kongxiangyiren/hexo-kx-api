import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RapidocModule } from '@b8n/nestjs-rapidoc';
import { join } from 'path';
import { readFileSync } from 'fs';
import { ROOT_PATH } from './base.controller';
import { morganMiddleware } from './config/middleware';
import { Request } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 修复 req.ip 问题
  app.set('trust proxy', 1);
  // 隐藏 x-powered-by
  app.disable('x-powered-by');
  // 使用 morgan 中间件
  app.use(morganMiddleware);
  // 允许跨域
  app.enableCors();

  const pac = readFileSync(join(ROOT_PATH, 'package.json'), 'utf-8');
  const options = new DocumentBuilder()
    .setTitle(JSON.parse(pac).name)
    .setDescription(readFileSync(join(ROOT_PATH, 'README.md'), 'utf-8'))
    .setVersion(JSON.parse(pac).version)
    .addServer('/', 'api server')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  RapidocModule.setup('/', app, document, {
    customSiteTitle: JSON.parse(pac).name,
    customFavIcon: '/favicon.ico',
    rapidocOptions: {
      allowServerSelection: false,
      showHeader: false,
      allowAuthentication: false,
      loadFonts: false
    },
    patchDocumentOnRequest: (request, res, document) => {
      const req = request as Request;

      const reg = new RegExp('http://127.0.0.1:3000', 'g');
      const json = JSON.parse(
        JSON.stringify(document).replace(reg, `${req.protocol}://${req.headers.host}`)
      );

      return json;
    }
  });

  await app.listen(3000);
}
bootstrap();
