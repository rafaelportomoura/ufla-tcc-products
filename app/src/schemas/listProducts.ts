import { z } from 'zod';
import { SORTS, SORT_BY, SORT_KEY } from '../constants/search';
import { product_schema, project_product_schema } from './product';
import { search_schema } from './search';

export const list_products_schema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(10),
    sort: z.enum(SORTS).default(SORT_KEY.DESC),
    sort_by: z.enum(SORT_BY).default('created_at'),
    search: search_schema({
      _id: product_schema._id,
      name: product_schema.name.max(250),
      description: product_schema.description.max(250),
      price: product_schema.price,
      created_at: z.string(),
      updated_at: z.string()
    }).optional(),
    project: project_product_schema.optional()
  })
  .strict();
