import { z } from 'zod';
import { product_schema } from '../schemas/product';

export type Product = z.infer<typeof product_schema>;
