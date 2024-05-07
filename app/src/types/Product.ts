export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  images: Array<string>;
};
