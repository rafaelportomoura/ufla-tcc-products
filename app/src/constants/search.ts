export const OPERATOR = {
  NE: 'ne',
  EQ: 'eq',
  IN: 'in',
  NIN: 'nin',
  REGEX: 'regex',
  LT: 'lt',
  LTE: 'lte',
  GT: 'gt',
  GTE: 'gte'
} as const;

export const OPERATORS = [...Object.values(OPERATOR)];

export const OPERATORS_MAP_TO_MONGO = {
  [OPERATOR.NE]: (v: unknown) => ({ $ne: v }),
  [OPERATOR.EQ]: (v: unknown) => ({ $eq: v }),
  [OPERATOR.IN]: (v: unknown) => ({ $in: v }),
  [OPERATOR.NIN]: (v: unknown) => ({ $nin: v }),
  [OPERATOR.REGEX]: (v: string) => ({ $regex: new RegExp(v, 'igm') }),
  [OPERATOR.LT]: (v: unknown) => ({ $lt: v }),
  [OPERATOR.LTE]: (v: unknown) => ({ $lte: v }),
  [OPERATOR.GT]: (v: unknown) => ({ $gt: v }),
  [OPERATOR.GTE]: (v: unknown) => ({ $gte: v })
} as const;

export const SORT_BY = ['name', 'status', 'created_at', 'price'] as const;

export const SORT_KEY = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

export const SORT = {
  [SORT_KEY.ASC]: 1,
  [SORT_KEY.DESC]: -1
} as const;

export const SORTS = [SORT_KEY.ASC, SORT_KEY.DESC] as const;
