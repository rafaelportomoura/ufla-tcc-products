import { z } from 'zod';
import { project_product_schema } from './product';

export const get_product_path_schema = z
  .object({
    product_id: z.string()
  })
  .strict();

export const get_product_query_schema = z
  .object({
    project: project_product_schema.optional()
  })
  .strict();
