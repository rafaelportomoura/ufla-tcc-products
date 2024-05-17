import { z } from 'zod';
import { product_schema } from './product';

export const remove_image_path_schema = z
  .object({
    product_id: product_schema._id,
    image_id: z
      .string()
      .max(264)
      .transform((v) => v.split('/').at(-1))
      .refine((v) => (v as string)?.length > 0, { message: 'Invalid image_id' })
  })
  .strict();
