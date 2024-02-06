import { FastifyBaseLogger } from 'fastify';
import { AwsParams } from './Aws';

export type AddImageArgs = {
  aws_params: AwsParams;
  logger: FastifyBaseLogger;
  bucket: string;
};

export type AddImageResponse = {
  image_id: string;
};
