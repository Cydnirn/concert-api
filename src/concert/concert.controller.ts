import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('concert')
export class ConcertController {
  constructor(private configService: ConfigService) {}

  @Get()
  getConcert() {
    return `Return all concert with env ${this.configService.get<string>('DATABASE_NAME')}`;
  }
}
