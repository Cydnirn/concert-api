import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class CreateConcertDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  details: string;
}

@Exclude()
export class ConcertDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  details: string;
}