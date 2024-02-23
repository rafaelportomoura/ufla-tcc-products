import { isEmpty } from 'lodash';
import { ZodEnum, ZodNumber, ZodOptional, ZodPipeline, ZodType, ZodTypeAny, z } from 'zod';
import { OPERATOR } from '../constants/search';
import { Operator } from '../types/Search';

export const project_schema = <T extends string>(...keys: T[]) => {
  const obj = {} as Record<T, ZodOptional<ZodPipeline<ZodEnum<['0', '1']>, ZodNumber>>>;
  for (const key of keys) {
    obj[key] = z.enum(['0', '1']).pipe(z.coerce.number()).optional();
  }

  return z
    .object(obj)
    .strict()
    .refine((v) => {
      const values = Object.values(v);
      return values.every((a) => a === values[0]);
    }, 'Cannot do inclusion and exclusion projection');
};

const xor = (a: boolean, b: boolean) => (a && !b) || (!a && b);

const and = (...args: unknown[]) => args.reduce((p, v) => Boolean(p) && Boolean(v));

const or = (...args: unknown[]) => args.reduce((p, v) => Boolean(p) || Boolean(v));

const conflict_operator_check = (a: unknown, b: unknown) => {
  const just_a_or_just_b_is_filled = xor(!isEmpty(a), !isEmpty(b));
  const a_and_b_is_empty = and(isEmpty(a), isEmpty(b));
  const just_one_or_none = or(a_and_b_is_empty, just_a_or_just_b_is_filled);
  return just_one_or_none;
};

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
      .refine(
        (arg) => conflict_operator_check(arg[OPERATOR.EQ], arg[OPERATOR.NE]),
        'Cannot use EQ and NE with the same property!'
      )
      .refine(
        (arg) => conflict_operator_check(arg[OPERATOR.NIN], arg[OPERATOR.IN]),
        'Cannot use IN and NIN with the same property!'
      )
      .optional();
  }

  return z.object(obj);
};
