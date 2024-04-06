import { ApiProperty } from "@nestjs/swagger";

export class CreateConcertDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  details: string;
}
