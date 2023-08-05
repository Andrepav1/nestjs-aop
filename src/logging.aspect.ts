import { Aspect, AspectContext } from 'ts-aspect';
import { LoggerService } from './logger.service';

export class LoggingAspect implements Aspect {
  constructor(private readonly logger: LoggerService) {}

  execute(ctx: AspectContext): any {
    this.logger.debug({ ctx });
    console.log('Aspect was called with Context: ', ctx);
  }
}
