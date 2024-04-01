import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { ConcertService } from './concert/concert.service';
import { ConcertController } from './concert/concert.controller';
import { ConcertModule } from './concert/concert.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    CatsModule,
    ConcertModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ConcertController],
  providers: [AppService, ConcertService],
})
export class AppModule {}
