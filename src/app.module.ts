import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { ConcertService } from './concert/concert.service';
import { ConcertController } from './concert/concert.controller';
import { ConcertModule } from './concert/concert.module';

@Module({
  imports: [CatsModule, ConcertModule],
  controllers: [AppController, ConcertController],
  providers: [AppService, ConcertService],
})
export class AppModule {}
