const collection_name =
  <N extends string>(name: N) =>
  <S, T>(stage: S, tenant: T) =>
    `${stage}_${tenant}_${name}` as const;

export const COLLECTION_NAMES = {
  PRODUCTS: collection_name('products' as const)
} as const;
