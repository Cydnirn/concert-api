import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateConcertDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  organizer: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  venue: string;

  @ApiProperty()
  artist: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  details: string;

  @ApiProperty({ required: false })
  image?: string;
}

export class UpdateConcertDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  organizer?: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false })
  venue?: string;

  @ApiProperty({ required: false })
  artist?: string;

  @ApiProperty({ required: false })
  date?: Date;

  @ApiProperty({ required: false })
  details?: string;

  @ApiProperty({ required: false })
  image?: string;
}

export class ConcertDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  organizer: string;

  @ApiProperty()
  @Expose()
  date: Date;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  venue: string;

  @ApiProperty()
  @Expose()
  artist: string;

  @ApiProperty()
  @Expose()
  details: string;

  @ApiProperty({ required: false })
  @Expose()
  image?: string;
}
