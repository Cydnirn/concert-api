import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseDto<T> {
  @ApiProperty()
  @Expose()
  statusCode: number;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  data: T;
}
