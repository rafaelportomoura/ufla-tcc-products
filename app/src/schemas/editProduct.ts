import { z } from 'zod';
import { product_schema } from './product';

export const edit_product_schema = z.object({
  name: product_schema.name_schema.optional(),
  details: product_schema.details_schema.optional(),
  price: product_schema.price_schema.optional()
});
