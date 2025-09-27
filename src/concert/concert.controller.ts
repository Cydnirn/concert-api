import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import {
  ConcertDto,
  CreateConcertDto,
  UpdateConcertDto,
} from '../dto/concert.dto';
import { plainToInstance } from 'class-transformer';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

@Controller('concert')
export class ConcertController {
  constructor(private concertService: ConcertService) {}

  @ApiExtraModels(ConcertDto)
  @ApiResponse({
    status: 200,
    schema: {
      $ref: getSchemaPath(ConcertDto),
    },
  })
  @Get()
  async getConcert(): Promise<ConcertDto[]> {
    try {
      const concerts = await this.concertService.find();
      return plainToInstance(ConcertDto, concerts);
    } catch (err: any) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: err.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async getConcertById(@Param('id') id: number): Promise<ConcertDto> {
    try {
      const concert = await this.concertService.findOne(id);
      return plainToInstance(ConcertDto, concert);
    } catch (err: any) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: err.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  async postConcert(
    @Body() createConcertDto: CreateConcertDto,
  ): Promise<ConcertDto> {
    try {
      const concert = await this.concertService.create(createConcertDto);
      return plainToInstance(ConcertDto, concert);
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

  @Put(':id')
  async putConcert(
    @Param('id') id: number,
    @Body() updateConcertDto: UpdateConcertDto,
  ): Promise<ConcertDto> {
    try {
      const concert = await this.concertService.update(id, updateConcertDto);
      return plainToInstance(ConcertDto, concert);
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

  @Delete(':id')
  async deleteConcert(@Param('id') id: number): Promise<void> {
    try {
      await this.concertService.delete(id);
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
