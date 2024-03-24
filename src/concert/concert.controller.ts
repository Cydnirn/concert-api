import { Controller, Get } from '@nestjs/common';

@Controller('concert')
export class ConcertController {
  @Get()
  getConcert() {
    return 'Return all concert';
  }
}
