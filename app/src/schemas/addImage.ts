import { z } from 'zod';

export const add_image_path_schema = z
  .object({
    product_id: z.string()
  })
  .strict();
