import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { two_decimals_number } from '../utils/number';
import { project_schema } from './search';

export const product_schema = {
  _id: z.string().max(64).refine(isValidObjectId, 'Invalid ObjectId'),
  name: z.string().min(1).max(250),
  description: z.string().min(0).max(250),
  price: z.coerce.number().positive().refine(two_decimals_number)
};

export const project_product_schema = project_schema(
  '_id',
  'name',
  'description',
  'price',
  'created_at',
  'updated_at',
  'images',
  'status'
);
