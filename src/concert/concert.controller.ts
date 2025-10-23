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
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

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
  async getConcert(): Promise<ResponseDto<ConcertDto[]>> {
    try {
      const concerts = await this.concertService.find();
      return plainToInstance(ResponseDto<ConcertDto[]>, {
        data: plainToInstance(ConcertDto, concerts),
        message: 'Concerts retrieved successfully',
        statusCode: HttpStatus.OK,
      });
    } catch (err: any) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: err.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async getConcertById(
    @Param('id') id: string,
  ): Promise<ResponseDto<ConcertDto>> {
    try {
      const concert = await this.concertService.findOne(id);
      return plainToInstance(ResponseDto<ConcertDto>, {
        data: plainToInstance(ConcertDto, concert),
        message: 'Concert retrieved successfully',
        statusCode: HttpStatus.OK,
      });
    } catch (err: any) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: err.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Concert name',
          example: 'Summer Music Festival',
        },
        organizer: {
          type: 'string',
          description: 'Concert organizer',
          example: 'Music Events Inc',
        },
        details: {
          type: 'string',
          description: 'Concert details',
          example: 'Annual outdoor music festival',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Concert image (jpg, jpeg, png, gif)',
        },
      },
      required: ['name', 'organizer', 'details'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Concert created successfully',
    type: ConcertDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or file type',
  })
  async postConcert(
    @Req() req: FastifyRequest,
  ): Promise<ResponseDto<ConcertDto>> {
    try {
      // Check if request is multipart
      if (!req.isMultipart()) {
        throw new Error('Request must be multipart/form-data');
      }

      let name = '';
      let details = '';
      let filename = '';
      let organizer = '';

      // Process multipart data
      const parts = req.parts();

      for await (const part of parts) {
        if (part.type === 'file') {
          filename = await this.concertService.saveImage({
            file: part.file,
            filename: part.filename,
            mimetype: part.mimetype,
          });
        } else {
          // Handle form fields
          if (part.fieldname === 'name') {
            name = part.value as string;
          } else if (part.fieldname === 'details') {
            details = part.value as string;
          } else if (part.fieldname === 'organizer') {
            organizer = part.value as string;
          }
        }
      }

      // Create concert
      const createConcertDto: CreateConcertDto = {
        name,
        details,
        organizer,
      };

      const concert = await this.concertService.create(
        createConcertDto,
        filename || undefined,
      );

      return plainToInstance(ResponseDto<ConcertDto>, {
        data: plainToInstance(ConcertDto, concert),
        message: 'Concert created successfully',
        statusCode: HttpStatus.CREATED,
      });
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
    @Param('id') id: string,
    @Body() updateConcertDto: UpdateConcertDto,
  ): Promise<ResponseDto<ConcertDto>> {
    try {
      const concert = await this.concertService.update(id, updateConcertDto);
      return plainToInstance(ResponseDto<ConcertDto>, {
        data: plainToInstance(ConcertDto, concert),
        message: 'Concert updated successfully',
        statusCode: HttpStatus.OK,
      });
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
  async deleteConcert(@Param('id') id: number): Promise<ResponseDto<void>> {
    try {
      await this.concertService.delete(id);
      return plainToInstance(ResponseDto<void>, {
        data: undefined,
        message: 'Concert deleted successfully',
        statusCode: HttpStatus.NO_CONTENT,
      });
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
