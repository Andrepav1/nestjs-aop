import { Injectable } from '@nestjs/common';
import { LogClassDecorator, LogDecorator, Logger } from './decorator';

// @ClassLogger()
// @LogClassDecorator()
@Injectable()
export class AppService {
  // @Logger()
  // @LogDecorator()
  async getHello(name = 'world'): Promise<string> {
    // throw new Error('THIS IS AN ERROR');
    return 'Hello ' + name;
  }
}
