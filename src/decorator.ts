import { LoggerService } from './logger.service';
import {
  Aspect,
  LazyDecorator,
  WrapParams,
  createClassDecorator,
  createDecorator,
} from './nestjs-aop';

export const CLASS_LOGGER_DECORATOR = Symbol('CLASS_LOGGER_DECORATOR');
export const LOGGER_DECORATOR = Symbol('LOGGER_DECORATOR');

export const ClassLogger = () => createClassDecorator(CLASS_LOGGER_DECORATOR);
export const Logger = () => createDecorator(LOGGER_DECORATOR);

// @Aspect(LOGGER_DECORATOR)
@Aspect(CLASS_LOGGER_DECORATOR)
export class LoggerDecorator implements LazyDecorator<any> {
  constructor(private readonly logger: LoggerService) {}

  wrap({ method, wrapper, args: initArgs, target }: WrapParams<any>) {
    return (...args: any) => {
      this.logger.debug('CALLING METHOD', {
        args,
        wrapper,
        initArgs,
        target,
      });

      try {
        const result = method(args);
        this.logger.debug('RETURN METHOD', {
          result,
        });

        return result;
      } catch (error) {
        this.logger.debug('ERROR METHOD', {
          error,
        });
      }
    };
  }
}
