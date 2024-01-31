import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { createProduct } from '../controllers/createProduct';
import { editProduct } from '../controllers/editProduct';

export function router(server: FastifyInstance, _: FastifyRegisterOptions<FastifyPluginOptions>, done: () => void) {
  server.post('/', createProduct);
  server.put('/:product_id', editProduct);
  done();
}
