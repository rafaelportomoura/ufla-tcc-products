import { CONFIGURATION } from './configuration';

export const URLS = ({ TENANT, STAGE }: typeof CONFIGURATION) =>
  ({
    OAUTH: `http://oauth.${STAGE}-${TENANT}.local`
  }) as const;
