import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Concert } from './concert.entity';
import { Repository } from 'typeorm';
import { CreateConcertDto, UpdateConcertDto } from '../dto/concert.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { ConfigService } from '@nestjs/config';

const pump = promisify(pipeline);

@Injectable()
export class ConcertService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
  ) {}

  async create(
    concertDto: CreateConcertDto,
    imageFilename?: string,
  ): Promise<Concert> {
    const concert = this.concertRepository.create({
      ...concertDto,
      image: imageFilename,
    });
    return this.concertRepository.save(concert);
  }

  async find(): Promise<Concert[]> {
    return this.concertRepository.find();
  }

  async findOne(id: string): Promise<Concert> {
    const concert = await this.concertRepository.findOneBy({ id });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }
    return concert;
  }

  async update(
    id: string,
    concertDto: UpdateConcertDto,
    imageFilename?: string,
  ): Promise<Concert> {
    const existingConcert = await this.concertRepository.findOneBy({ id });
    if (!existingConcert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }

    const oldImage = existingConcert.image;

    const concert = await this.concertRepository.preload({
      id: id,
      ...concertDto,
      ...(imageFilename !== undefined && { image: imageFilename }),
    });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }

    const savedConcert = await this.concertRepository.save(concert);

    // Delete old image if a new image was provided and it's different from the old one
    if (imageFilename && oldImage && imageFilename !== oldImage) {
      await this.deleteImage(oldImage);
    }

    return savedConcert;
  }

  async delete(id: string): Promise<void> {
    const concert = await this.concertRepository.findOneBy({ id });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }

    await this.concertRepository.delete(id);

    if (concert.image) {
      await this.deleteImage(concert.image);
    }
  }

  async saveImage(image: {
    file: NodeJS.ReadableStream;
    filename: string;
    mimetype: string;
  }): Promise<string> {
    // Validate that it's actually an image
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(image.mimetype)) {
      throw new Error('File is not an image');
    }
    // Generate unique filename
    const filePath =
      this.configService.get<string>('FILE_DIRECTORY') ?? 'uploads';
    const ext = path.extname(image.filename);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    let filename = `${randomName}${ext}`;
    try {
      // Create a write stream to save the file
      const uploadPath = path.join(filePath, filename);

      // Ensure uploads directory exists
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      // Save file
      await pump(image.file, fs.createWriteStream(uploadPath));

      return filename;
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  async deleteImage(filename: string): Promise<void> {
    const filePath =
      this.configService.get<string>('FILE_DIRECTORY') ?? 'uploads';
    const imagePath = path.join(filePath, filename);
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteImages(filenames: string[]): Promise<void> {
    const filePath =
      this.configService.get<string>('FILE_DIRECTORY') ?? 'uploads';
    try {
      await Promise.all(
        filenames.map((filename) =>
          fs.promises.unlink(path.join(filePath, filename)),
        ),
      );
    } catch (error) {
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  }
}
