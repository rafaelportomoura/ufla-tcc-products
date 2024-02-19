import { z } from 'zod';
import { ORDERS, ORDER_BY, ORDER_KEY } from '../constants/search';
import { STATUS } from '../constants/status';
import { product_schema, project_product_schema } from './product';
import { search_schema } from './search';

export const list_products_schema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(10),
    order: z.enum(ORDERS).default(ORDER_KEY.DESC),
    order_by: z.enum(ORDER_BY).default('created_at'),
    search: search_schema({
      _id: product_schema._id,
      name: product_schema.name.max(250),
      description: product_schema.description.max(250),
      price: product_schema.price,
      status: z.enum(STATUS),
      created_at: z.string(),
      updated_at: z.string()
    }).optional(),
    project: project_product_schema.optional()
  })
  .strict();
