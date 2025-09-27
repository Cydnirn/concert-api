import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateConcertDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  details: string;
}

export class UpdateConcertDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  details?: string;
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
  details: string;
}
