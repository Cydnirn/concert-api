export interface IConcert {
  id: number;
  name: string;
  details?: string;
  organizer: string;
  image: string;
  createdAt: Date;
  price: number;
  venue: string;
  artist: string;
}
