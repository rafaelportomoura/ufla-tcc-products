import { fromIni } from '@aws-sdk/credential-providers';
import { CONFIGURATION } from '../constants/configuration';
import { AwsParams } from '../types/Aws';

export const aws_config = ({ region }: AwsParams) => ({ region, credentials: fromIni({ profile: 'tcc' }) });

export const aws_params = () => ({ region: CONFIGURATION.REGION });
