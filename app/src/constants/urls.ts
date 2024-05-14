import { CONFIGURATION } from './configuration';

export const URLS = ({ OAUTH_URL }: typeof CONFIGURATION) =>
  ({
    OAUTH: OAUTH_URL
  }) as const;
