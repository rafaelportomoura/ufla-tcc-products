import { z } from 'zod';
import { STATUS } from '../constants/status';
import { two_decimals_number } from '../utils/number';

export const product_schema = z.object({
  _id: z.string(),
  name: z.string(),
  details: z.record(z.unknown()),
  price: z.number().refine(two_decimals_number),
  created_at: z.date(),
  updated_at: z.date(),
  status: z.enum(STATUS),
  images: z.array(z.string())
});
