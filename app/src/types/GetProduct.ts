import { FastifyBaseLogger } from 'fastify';
import { AwsParams } from './Aws';

export type GetProductArgs = {
  aws_params: AwsParams;
  logger: FastifyBaseLogger;
  images_base_url: string;
};
