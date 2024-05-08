import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { addImage } from '../controllers/addImage';
import { createProduct } from '../controllers/createProduct';
import { editProduct } from '../controllers/editProduct';
import { getProduct } from '../controllers/get';
import { listProducts } from '../controllers/list';
import { removeImage } from '../controllers/removeImage';

export function router(server: FastifyInstance, _: FastifyRegisterOptions<FastifyPluginOptions>, done: () => void) {
  server.post('/', createProduct);
  server.put('/:product_id', editProduct);
  server.get('/', listProducts);
  server.get('/:product_id', getProduct);
  server.delete('/:product_id/image/:image_id', removeImage);
  server.post('/:product_id/image', addImage);
  done();
}
