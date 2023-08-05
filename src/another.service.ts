import { Injectable } from '@nestjs/common';

@Injectable()
export class AnotherService {
  test(dog: string) {
    return 'test' + dog;
  }
}
