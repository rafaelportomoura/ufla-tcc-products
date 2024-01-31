import { Status } from './Status';

export type Product = {
  _id: string;
  name: string;
  details: Record<string, unknown>;
  price: number;
  created_at: Date;
  updated_at: Date;
  status: Status;
  images: Array<string>;
};
