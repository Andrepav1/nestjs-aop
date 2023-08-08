import {
  Module,
  applyDecorators,
  Injectable,
  SetMetadata,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  Reflector,
} from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { LoggerService } from './logger.service';

/* eslint-disable @typescript-eslint/ban-types */
export type WrapParams<T extends Function = Function, M = unknown> = {
  instance: any;
  methodName: string;
  method: T;
  metadata: M;
} & any;

/**
 * Aspect wrapper
 */
export interface LazyDecorator<T extends Function = Function, M = unknown> {
  wrap(params: WrapParams<T, M>): T;
}

export interface MetadataValue {
  metadata?: unknown;
  aopSymbol: symbol;
  originalFn: unknown;
}

/**
 * @param metadataKey equal to 1st argument of Aspect Decorator
 * @param metadata The value corresponding to the metadata of WrapParams. It can be obtained from LazyDecorator's warp method and used.
 */
export const createDecorator = (
  metadataKey: symbol | string,
  metadata?: unknown,
): MethodDecorator => {
  const aopSymbol = Symbol('AOP_DECORATOR');

  // Add metadata to the method and wrap the method before the lazy decorator is executed
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (!Reflect.hasMetadata(metadataKey, descriptor.value)) {
      Reflect.defineMetadata(metadataKey, [], descriptor.value);
    }
    const metadataValues: MetadataValue[] = Reflect.getMetadata(
      metadataKey,
      descriptor.value,
    );
    metadataValues.push({
      originalFn: descriptor.value,
      metadata,
      aopSymbol,
    });

    const originalFn = descriptor.value;

    descriptor.value = function (this: any, ...args: any[]) {
      if (this[aopSymbol]?.[propertyKey]) {
        // If there is a wrapper/decorator on the method, use it
        return this[aopSymbol][propertyKey].apply(this, args);
      }
      // otherwise, call originalFn
      return originalFn.apply(this, args);
    };

    /**
     * There are codes that using `function.name`.
     * Therefore the codes below are necessary.
     *
     * ex) @nestjs/swagger
     */
    Object.defineProperty(descriptor.value, 'name', {
      value: propertyKey.toString(),
      writable: false,
    });
    Object.setPrototypeOf(descriptor.value, originalFn);
  };
};

/**
 * If Aspect is declared and there is a provider that implements LazyDecorator,
 * LazyDecorator is applied to all registered providers in IOC
 */
@Injectable()
export class AutoAspectExecutor implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const controllers = this.discoveryService.getControllers();
    const providers = this.discoveryService.getProviders();

    const lazyDecorators = this.lookupLazyDecorators(providers);
    if (lazyDecorators.length === 0) {
      return;
    }

    const instanceWrappers = providers
      .concat(controllers)
      .filter(({ instance }) => instance && Object.getPrototypeOf(instance));

    for (const wrapper of instanceWrappers) {
      if (wrapper.name !== 'AppService') {
        // debugger;
        continue;
      } else {
        // debugger;
      }

      const target = wrapper.isDependencyTreeStatic()
        ? wrapper.instance
        : wrapper.metatype.prototype;

      // Use scanFromPrototype for support nestjs 8
      const methodNames = this.metadataScanner.scanFromPrototype(
        target,
        wrapper.isDependencyTreeStatic()
          ? Object.getPrototypeOf(target)
          : target,
        (name) => name,
      );

      const targetProto = Object.getPrototypeOf(target);

      for (const methodName of methodNames) {
        // lazyDecorators.forEach((lazyDecorator) => {
        //   debugger;
        //   const metadataKey = this.reflector.get(
        //     ASPECT,
        //     lazyDecorator.constructor,
        //   );

        //   const metadataList: {
        //     originalFn: any;
        //     metadata?: unknown;
        //     aopSymbol: symbol;
        //   }[] = this.reflector.get(metadataKey, target[methodName]);

        //   if (!metadataList) {
        //     return;
        //   }

        //   for (const { originalFn, metadata, aopSymbol } of metadataList) {

        const descriptor = Object.getOwnPropertyDescriptor(
          targetProto,
          methodName,
        );

        const originalFn = descriptor.value;

        // debugger;
        // Modify the property descriptor of the method printMessage
        Object.defineProperty(target, methodName, {
          value: async (...args) => {
            // debugger;
            console.log('BEFORE', { args });
            // Call the original function

            try {
              const result = await originalFn.call(this, ...args);
              console.log('AFTER', { result });
              return result;
            } catch (error) {
              console.log('ERROR', { error });
            }
          },
          writable: false,
          enumerable: true,
          configurable: true,
        });

        const proxy = new Proxy(target[methodName], {
          apply: (_, thisArg, args) => {
            console.log({ target, methodName, thisArg, args, wrapper });

            debugger;
            // const wrappedMethod = lazyDecorator.wrap({
            //   instance: thisArg,
            //   methodName,
            //   method: originalFn.bind(thisArg),
            //   metadata,
            //   args,
            //   target,
            //   wrapper,
            // });
            // return Reflect.apply(wrappedMethod, thisArg, args);
          },
        });

        // this is assigning {} only if target[aopSymbol] is undefined
        //     target[aopSymbol] ??= {};
        //     target[aopSymbol][methodName] = proxy;
        //   }
        // });
      }
    }
  }

  private lookupLazyDecorators(providers: InstanceWrapper[]): LazyDecorator[] {
    const { reflector } = this;

    return providers
      .filter((wrapper) => wrapper.isDependencyTreeStatic())
      .filter(({ instance, metatype }) => {
        if (!instance || !metatype) {
          return false;
        }
        const aspect =
          reflector.get<string>(ASPECT, metatype) ||
          reflector.get<string>(
            ASPECT,
            Object.getPrototypeOf(instance).constructor,
          );

        if (!aspect) {
          return false;
        }

        return typeof instance.wrap === 'function';
      })
      .map(({ instance }) => instance);
  }
}

export const ASPECT = Symbol('ASPECT');

/**
 * Decorator to apply to providers that implements LazyDecorator.
 * @see LazyDecorator
 */
export function Aspect(metadataKey: string | symbol) {
  return applyDecorators(SetMetadata(ASPECT, metadataKey), Injectable);
}

@Module({
  imports: [DiscoveryModule],
  providers: [AutoAspectExecutor],
})
export class AopModule {}
