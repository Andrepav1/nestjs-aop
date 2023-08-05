import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerService } from './logger.service';
import { AnotherService } from './another.service';
import { AopModule } from './nestjs-aop';
import { LoggerDecorator } from './decorator';

@Module({
  imports: [AopModule],
  controllers: [AppController],
  providers: [AppService, LoggerService, AnotherService, LoggerDecorator],
})
export class AppModule {}
