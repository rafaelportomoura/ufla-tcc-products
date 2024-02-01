import { ZodEnum, ZodNumber, ZodPipeline, ZodType, ZodTypeAny, z } from 'zod';
import { Operator } from '../types/Search';

export const project_schema = <T extends string>(...keys: T[]) => {
  const obj = {} as Record<T, ZodPipeline<ZodEnum<['0', '1']>, ZodNumber>>;
  for (const key of keys) {
    obj[key] = z.enum(['0', '1']).pipe(z.coerce.number());
  }

  return z.object(obj);
};

const xor = (a: unknown, b: unknown) => (a && !b) || (!a && b);

export const search_schema = <T extends string, Y extends ZodTypeAny>(types: Record<T, Y>) => {
  const obj = {} as Record<T, ZodType<Record<Operator, Y>>>;
  for (const key of Object.keys(types)) {
    const schema = types[key as keyof typeof types];
    const optional = schema.optional();
    (obj as Record<string, unknown>)[key] = z
      .object({
        NE: optional,
        EQ: optional,
        IN: z.array(schema).min(1).optional(),
        NIN: z.array(schema).min(1).optional(),
        REGEX: z.string().optional(),
        LT: optional,
        LTE: optional,
        GT: optional,
        GTE: optional
      })
      .refine((arg) => !xor(arg.EQ, arg.NE), 'Cannot use EQ and NE with the same property!')
      .refine((arg) => !xor(arg.NIN, arg.IN), 'Cannot use IN and NIN with the same property!');
  }

  return z.object(obj);
};
