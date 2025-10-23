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
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ConcertService } from './concert.service';
import {
  ConcertDto,
  CreateConcertDto,
  UpdateConcertDto,
} from '../dto/concert.dto';
import { plainToInstance } from 'class-transformer';
import {
  ApiExtraModels,
  ApiResponse,
  ApiConsumes,
  getSchemaPath,
} from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

const pump = promisify(pipeline);

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
  @ApiConsumes('multipart/form-data')
  async postConcert(@Req() req: FastifyRequest): Promise<ConcertDto> {
    try {
      // Check if request is multipart
      if (!req.isMultipart()) {
        throw new Error('Request must be multipart/form-data');
      }

      let name = '';
      let details = '';
      let filename = '';

      // Process multipart data
      const parts = req.parts();

      for await (const part of parts) {
        if (part.type === 'file') {
          // Handle file upload
          const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
          ];

          if (!allowedMimeTypes.includes(part.mimetype)) {
            throw new Error(
              'Only image files (jpg, jpeg, png, gif) are allowed!',
            );
          }

          // Generate unique filename
          const ext = path.extname(part.filename);
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          filename = `${randomName}${ext}`;
          const uploadPath = path.join('./uploads', filename);

          // Ensure uploads directory exists
          if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads', { recursive: true });
          }

          // Save file
          await pump(part.file, fs.createWriteStream(uploadPath));
        } else {
          // Handle form fields
          if (part.fieldname === 'name') {
            name = part.value as string;
          } else if (part.fieldname === 'details') {
            details = part.value as string;
          }
        }
      }

      // Create concert
      const createConcertDto: CreateConcertDto = {
        name,
        details,
      };

      const concert = await this.concertService.create(
        createConcertDto,
        filename || undefined,
      );

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
