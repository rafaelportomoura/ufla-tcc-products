import { z } from 'zod';
import { product_schema, project_product_schema } from './product';

export const get_product_path_schema = z
  .object({
    product_id: product_schema._id
  })
  .strict();

export const get_product_query_schema = z
  .object({
    project: project_product_schema.optional()
  })
  .strict();
