import { product_schema } from './product';

export const create_product_schema = product_schema.pick({
  name: true,
  details: true,
  price: true
});
