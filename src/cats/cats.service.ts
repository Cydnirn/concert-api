import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly Cats: [];

  public getAll(): [] {
    return this.Cats;
  }
}
