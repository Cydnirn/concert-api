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

  async update(id: string, concertDto: UpdateConcertDto): Promise<Concert> {
    const concert = await this.concertRepository.preload({
      id: id,
      ...concertDto,
    });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }
    return this.concertRepository.save(concert);
  }

  async delete(id: number): Promise<void> {
    const result = await this.concertRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
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
}
