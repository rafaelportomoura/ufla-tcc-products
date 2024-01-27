import { fromIni } from '@aws-sdk/credential-providers';
import { CONFIGURATION } from './configuration';

export const AWS_CONFIGURATION = {
  region: CONFIGURATION.REGION,
  credentials: fromIni({ profile: 'tcc' })
} as const;
