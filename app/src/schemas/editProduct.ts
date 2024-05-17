import { isEmpty } from 'lodash';
import { z } from 'zod';
import { product_schema } from './product';

export const edit_product_schema = z
  .object({
    name: product_schema.name.optional(),
    description: product_schema.description.optional(),
    price: product_schema.price.optional()
  })
  .strict()
  .refine((v) => !isEmpty(v), { message: 'Empty object is not allowed' });
