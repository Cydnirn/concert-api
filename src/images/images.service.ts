import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImagesService {
  constructor(private configService: ConfigService) {}

  async get(imageName: string) {
    const uploadsPath =
      this.configService.get<string>('FILE_DIRECTORY') || './uploads';
    const imagePath = join(uploadsPath, imageName);

    try {
      await stat(imagePath);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }

    return createReadStream(imagePath);
  }
}
