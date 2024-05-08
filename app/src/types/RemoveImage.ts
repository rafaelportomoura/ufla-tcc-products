import { Logger } from '../adapters/logger';
import { AwsConfig } from './Aws';

export type RemoveImageArgs = {
  aws_params: AwsConfig;
  logger: Logger;
  bucket: string;
};
