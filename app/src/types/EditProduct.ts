import { FastifyBaseLogger } from 'fastify';
import { z } from 'zod';
import { edit_product_schema } from '../schemas/editProduct';
import { AwsParams } from './Aws';

export type EditProductPayload = z.infer<typeof edit_product_schema>;

export type EditProductArgs = AwsParams & {
  logger: FastifyBaseLogger;
  topic: string;
};
