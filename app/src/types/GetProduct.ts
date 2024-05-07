import { Logger } from '../adapters/logger';
import { AwsConfig } from './Aws';

export type GetProductArgs = {
  aws_params: AwsConfig;
  logger: Logger;
  images_base_url: string;
};
