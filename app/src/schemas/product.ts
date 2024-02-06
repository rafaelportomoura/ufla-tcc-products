import { z } from 'zod';
import { two_decimals_number } from '../utils/number';
import { project_schema } from './search';

export const product_schema = {
  name_schema: z.string().min(1).max(250),
  description_schema: z.string().min(1).max(250),
  price_schema: z.coerce.number().refine(two_decimals_number)
};

export const project_product_schema = project_schema(
  'name',
  'description',
  'price',
  'created_at',
  'updated_at',
  'images',
  'status'
);
