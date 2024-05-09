/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import qs from 'fastify-qs';

import { StatusCodes } from 'http-status-codes';
import { CONFIGURATION } from '../constants/configuration';
import { router } from '../routes';

(async () => {
  const server = Fastify({
    logger: true
  });
  await server.register(qs, {});
  await server.register(multipart);
  server.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_, __, done) => done(null));

  server.get('/health-check', (_, res) => res.status(StatusCodes.OK).send('alive'));

  await server.register(router);

  server.listen(
    {
      port: CONFIGURATION.PORT,
      host: '0.0.0.0'
    },
    (err, addr) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.info(`RUNNING ON PORT ${addr}`);
    }
  );
})();
