import { z } from 'zod';
import { product_schema } from './product';

export const create_product_schema = z
  .object({
    name: product_schema.name_schema,
    description: product_schema.description_schema.default(''),
    price: product_schema.price_schema
  })
  .strict();
