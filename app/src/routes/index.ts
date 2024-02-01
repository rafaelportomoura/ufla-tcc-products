import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { createProduct } from '../controllers/createProduct';
import { editProduct } from '../controllers/editProduct';
import { listProducts } from '../controllers/list';

export function router(server: FastifyInstance, _: FastifyRegisterOptions<FastifyPluginOptions>, done: () => void) {
  server.post('/', createProduct);
  server.put('/:product_id', editProduct);
  server.get('/', listProducts);
  done();
}
