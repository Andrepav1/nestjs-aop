import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    try {
      // debugger;
      const result = await this.appService.getHello('Jimmy');
      return result;
    } catch (error) {
      console.log('controller error ---', error);
      return 'An error occurred';
    }
  }
}
