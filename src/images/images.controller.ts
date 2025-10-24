import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ImagesService } from './images.service';
import { lookup } from 'mime-types';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':imageName')
  async getImage(
    @Param('imageName') imageName: string,
    @Res() reply: FastifyReply,
  ) {
    const stream = await this.imagesService.get(imageName);

    const mimeType = lookup(imageName) || 'application/octet-stream';

    reply.type(mimeType);
    reply.send(stream);
  }
}
