import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * App controller
 * @description This class is used to handle the app controller.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
