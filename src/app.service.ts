import { Injectable } from '@nestjs/common';
import { ClassLogger, Logger } from './decorator';

@ClassLogger()
@Injectable()
export class AppService {
  // @Logger()
  getHello(name = 'world'): string {
    return 'Hello ' + name;
  }
}
