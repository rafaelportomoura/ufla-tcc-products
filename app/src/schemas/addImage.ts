import { z } from 'zod';
import { product_schema } from './product';

export const add_image_path_schema = z
  .object({
    product_id: product_schema._id
  })
  .strict();
