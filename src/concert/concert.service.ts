import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Concert } from './concert.schema';
import { Model } from 'mongoose';
import { CreateConcertDto } from 'src/dto/concert.dto';

@Injectable()
export class ConcertService {
  constructor(@InjectModel(Concert.name) private Concert: Model<Concert>) {}

  async create(concertDto: CreateConcertDto): Promise<Concert> {
    await this.Concert.create(concertDto);
    return concertDto;
  }

  async find(): Promise<Concert[]> {
    return await this.Concert.find();
  }
}
