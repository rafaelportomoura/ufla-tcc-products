import { z } from 'zod';

export const remove_image_path_schema = z
  .object({
    product_id: z.string(),
    image_id: z
      .string()
      .transform((v) => v.split('/').at(-1))
      .refine((v) => (v as string)?.length > 0, { message: 'Invalid image_id' })
  })
  .strict();
