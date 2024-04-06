import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConcertDocument = HydratedDocument<Concert>;

@Schema({ timestamps: true })
export class Concert {
  @Prop({ required: true })
  name: string;

  @Prop({ type: 'string' })
  details: string;
}

export const ConcertSchema = SchemaFactory.createForClass(Concert);
