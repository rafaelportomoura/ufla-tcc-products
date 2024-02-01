import { z } from 'zod';
import { two_decimals_number } from '../utils/number';

export const product_schema = {
  name_schema: z.string().min(1).max(250),
  description_schema: z.string().min(1).max(250),
  price_schema: z.number().refine(two_decimals_number)
};
