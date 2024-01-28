import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { createProduct } from '../controllers/createProduct';

export function router(server: FastifyInstance, _: FastifyRegisterOptions<FastifyPluginOptions>, done: () => void) {
  server.post('/', createProduct);
  done();
}
