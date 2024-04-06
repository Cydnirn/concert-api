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
import { ConcertDto, CreateConcertDto } from 'src/dto/concert.dto';
import { plainToInstance } from 'class-transformer';

@Controller('concert')
export class ConcertController {
  constructor(
    private configService: ConfigService,
    private concertService: ConcertService,
  ) {}

  @Get()
  async getConcert(): Promise<ConcertDto> {
    const Concerts = this.concertService.find();
    return plainToInstance(ConcertDto, Concerts);
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
