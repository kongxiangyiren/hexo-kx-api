import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { ApiController } from './api/api/api.controller';
import { DjtController } from './api/djt/djt.controller';
import { IpController } from './api/ip/ip.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [ApiController, IpController, DjtController],
  providers: [AppService]
})
export class AppModule {}
