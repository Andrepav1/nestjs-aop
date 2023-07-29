import { Aspect, AspectContext } from 'ts-aspect';

export class LoggingAspect implements Aspect {
  execute(ctx: AspectContext): any {
    console.log('Aspect was called with Context: ', ctx);
  }
}
