import { Status } from './Status';

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  status: Status;
  images: Array<string>;
};
