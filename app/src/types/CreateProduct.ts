import { z } from 'zod';
import { Logger } from '../adapters/logger';
import { STATUS_MAP } from '../constants/status';
import { create_product_schema } from '../schemas/createProduct';
import { AwsConfig } from './Aws';
import { CodeMessage } from './CodeMessage';

export type CreateProductResponse = CodeMessage & {
  product_id: string;
};

export type CreateProductPayload = z.infer<typeof create_product_schema>;

export type RawProduct = CreateProductPayload & {
  status: typeof STATUS_MAP.UNAVAILABLE;
  images: [];
};

export type CreateProductArgs = {
  logger: Logger;
  aws_params: AwsConfig;
  topic: string;
};
