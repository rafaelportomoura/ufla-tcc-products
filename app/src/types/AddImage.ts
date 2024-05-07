import { Logger } from '../adapters/logger';
import { AwsConfig } from './Aws';

export type AddImageArgs = {
  aws_params: AwsConfig;
  logger: Logger;
  bucket: string;
};

export type AddImageResponse = {
  image_id: string;
};
