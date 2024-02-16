import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { project_product_schema } from './product';

export const get_product_path_schema = z
  .object({
    product_id: z.string().refine((value) => isValidObjectId(value), 'Invalid ObjectId')
  })
  .strict();

export const get_product_query_schema = z
  .object({
    project: project_product_schema.optional()
  })
  .strict();
