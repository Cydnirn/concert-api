import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateConcertDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  organizer: string;

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
  details: string;

  @ApiProperty({ required: false })
  @Expose()
  image?: string;
}
