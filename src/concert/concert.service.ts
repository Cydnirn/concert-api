import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Concert } from './concert.entity';
import { Repository } from 'typeorm';
import { CreateConcertDto, UpdateConcertDto } from '../dto/concert.dto';

@Injectable()
export class ConcertService {
  constructor(
    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
  ) {}

  async create(concertDto: CreateConcertDto): Promise<Concert> {
    const concert = this.concertRepository.create(concertDto);
    return this.concertRepository.save(concert);
  }

  async find(): Promise<Concert[]> {
    return this.concertRepository.find();
  }

  async findOne(id: number): Promise<Concert> {
    const concert = await this.concertRepository.findOneBy({ id });
    if (!concert) {
      throw new NotFoundException(`Concert with ID ${id} not found`);
    }
    return concert;
  }

  async update(id: number, concertDto: UpdateConcertDto): Promise<Concert> {
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
}
