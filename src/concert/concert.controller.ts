import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConcertService } from './concert.service';
import { CreateConcertDto } from 'src/dto/concert.dto';
import { error } from 'console';

@Controller('concert')
export class ConcertController {
  constructor(
    private configService: ConfigService,
    private concertService: ConcertService,
  ) {}

  @Get()
  getConcert() {
    return this.concertService.find();
  }

  @Post()
  postConcert(@Body() createConcertDto: CreateConcertDto) {
    try {
      return this.concertService.create(createConcertDto);
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
