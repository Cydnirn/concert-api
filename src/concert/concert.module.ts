import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Concert } from './concert.entity';
import { ConcertController } from './concert.controller';
import { ConcertService } from './concert.service';

@Module({
  imports: [TypeOrmModule.forFeature([Concert]), ConfigModule],
  controllers: [ConcertController],
  providers: [ConcertService],
})
export class ConcertModule {}
