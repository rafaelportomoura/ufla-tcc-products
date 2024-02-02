import { ZodEnum, ZodNumber, ZodOptional, ZodPipeline, ZodType, ZodTypeAny, z } from 'zod';
import { OPERATOR } from '../constants/search';
import { Operator } from '../types/Search';

export const project_schema = <T extends string>(...keys: T[]) => {
  const obj = {} as Record<T, ZodOptional<ZodPipeline<ZodEnum<['0', '1']>, ZodNumber>>>;
  for (const key of keys) {
    obj[key] = z.enum(['0', '1']).pipe(z.coerce.number()).optional();
  }

  return z.object(obj).strict();
};

const xor = (a: unknown, b: unknown) => (a && !b) || (!a && b);

export const search_schema = <T extends string, Y extends ZodTypeAny>(types: Record<T, Y>) => {
  const obj = {} as Record<T, ZodType<Record<Operator, z.infer<Y>>>>;
  for (const key of Object.keys(types)) {
    const schema = types[key as keyof typeof types];
    const optional = schema.optional();
    (obj as Record<string, unknown>)[key] = z
      .object({
        [OPERATOR.NE]: optional,
        [OPERATOR.EQ]: optional,
        [OPERATOR.IN]: z.array(schema).min(1).optional(),
        [OPERATOR.NIN]: z.array(schema).min(1).optional(),
        [OPERATOR.REGEX]: z.string().optional(),
        [OPERATOR.LT]: optional,
        [OPERATOR.LTE]: optional,
        [OPERATOR.GT]: optional,
        [OPERATOR.GTE]: optional
      })
      .strict()
      .refine((arg) => !xor(arg[OPERATOR.EQ], arg[OPERATOR.NE]), 'Cannot use EQ and NE with the same property!')
      .refine((arg) => !xor(arg[OPERATOR.NIN], arg[OPERATOR.IN]), 'Cannot use IN and NIN with the same property!')
      .optional();
  }

  return z.object(obj);
};
