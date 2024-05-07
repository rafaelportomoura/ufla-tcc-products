import { z } from 'zod';
import { Logger } from '../adapters/logger';
import { edit_product_schema } from '../schemas/editProduct';
import { AwsConfig } from './Aws';

export type EditProductPayload = z.infer<typeof edit_product_schema>;

export type EditProductArgs = {
  aws_params: AwsConfig;
  logger: Logger;
  topic: string;
};
