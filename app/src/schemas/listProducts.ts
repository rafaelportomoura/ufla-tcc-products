import { z } from 'zod';
import { ORDERS, ORDER_BY, ORDER_KEY } from '../constants/search';
import { STATUS } from '../constants/status';
import { project_schema, search_schema } from './search';

export const list_products_schema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).default(10),
    order: z.enum(ORDERS).default(ORDER_KEY.DESC),
    order_by: z.enum(ORDER_BY).default('created_at'),
    search: search_schema({
      name: z.string().max(250),
      description: z.string().max(250),
      status: z.enum(STATUS),
      created_at: z.string(),
      updated_at: z.string()
    }).optional(),
    project: project_schema(
      'name',
      'description',
      'price',
      'created_at',
      'updated_at',
      'images',
      'status',
      '_id'
    ).optional()
  })
  .strict();
