import { QueryOptions } from 'mongoose';
import { z } from 'zod';
import { Logger } from '../adapters/logger';
import { list_products_schema } from '../schemas/listProducts';
import { AwsConfig } from './Aws';
import { Product } from './Product';

export type ListProductsArgs = {
  aws_params: AwsConfig;
  logger: Logger;
  images_base_url: string;
};

export type ListProductsResponse = {
  page: number;
  pages: number;
  count: number;
  products: Array<Product>;
};

export type ListProductsFilter = z.infer<typeof list_products_schema>;

export type ListProductsOptions = Required<Pick<QueryOptions<Product>, 'sort' | 'limit' | 'skip'>>;
