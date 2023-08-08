import { Inject } from '@nestjs/common';
import { LoggerService } from './logger.service';
import {
  Aspect,
  LazyDecorator,
  WrapParams,
  createDecorator,
} from './nestjs-aop';

// export const CLASS_LOGGER_DECORATOR = Symbol('CLASS_LOGGER_DECORATOR');
export const LOGGER_DECORATOR = Symbol('LOGGER_DECORATOR');

// export const ClassLogger = () => createClassDecorator(CLASS_LOGGER_DECORATOR);
export const Logger = () => createDecorator(LOGGER_DECORATOR);

@Aspect(LOGGER_DECORATOR)
// @Aspect(CLASS_LOGGER_DECORATOR)
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

      //   debugger;
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
        throw error;
      }
    };
  }
}

export function LogClassDecorator(): ClassDecorator {
  const injectLogger = Inject(LoggerService);

  return (target: any) => {
    debugger;
    // this is the same as using constructor(private readonly logger: LoggerService) in a class
    injectLogger(target, 'logger');
    // get original method
    // const originalMethod = propertyDescriptor.value;
    //redefine descriptor value within own function block
    // propertyDescriptor.value = async function (...args: any[]) {
    //   const logger: LoggerService = this.logger;
    //   try {
    //     logger.debug('CALLING FUNCTION', { args, propertyKey });
    //     const result = await originalMethod.apply(this, args);
    //     logger.debug('FUNCTION CALLED', { args, result });
    //     return result;
    //   } catch (error) {
    //     logger.debug('FUNCTION ERROR', { args, error });
    //   }
    // };
    /**
     * There are codes that using `function.name`.
     * Therefore the codes below are necessary.
     *
     * ex) @nestjs/swagger
     */
    // Object.defineProperty(propertyDescriptor.value, 'name', {
    //   value: propertyKey.toString(),
    //   writable: false,
    // });
    // Object.setPrototypeOf(propertyDescriptor.value, originalMethod);
  };
}

export function LogDecorator() {
  const injectLogger = Inject(LoggerService);

  return (
    target: any,
    propertyKey: string,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    // this is the same as using constructor(private readonly logger: LoggerService) in a class
    injectLogger(target, 'logger');

    // get original method
    const originalMethod = propertyDescriptor.value;

    //redefine descriptor value within own function block
    propertyDescriptor.value = async function (...args: any[]) {
      const logger: LoggerService = this.logger;
      try {
        logger.debug('CALLING FUNCTION', { args, propertyKey });

        const result = await originalMethod.apply(this, args);

        logger.debug('FUNCTION CALLED', { args, result });
        return result;
      } catch (error) {
        logger.debug('FUNCTION ERROR', { args, error });
      }
    };

    /**
     * There are codes that using `function.name`.
     * Therefore the codes below are necessary.
     *
     * ex) @nestjs/swagger
     */
    Object.defineProperty(propertyDescriptor.value, 'name', {
      value: propertyKey.toString(),
      writable: false,
    });
    Object.setPrototypeOf(propertyDescriptor.value, originalMethod);
  };
}
