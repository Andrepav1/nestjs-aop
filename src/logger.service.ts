import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  debug(...args: any[]) {
    console.log(args);
  }
}
