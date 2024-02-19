import { z } from 'zod';
import { product_schema } from './product';

export const create_product_schema = z
  .object({
    name: product_schema.name,
    description: product_schema.description.default(''),
    price: product_schema.price
  })
  .strict();
