import { SORT_BY, SORT_KEY } from '../../src/constants/search';
import { ListProductsFilter } from '../../src/types/ListProducts';

type Search = ListProductsFilter['search'];
type DeepPartial<T extends Record<string, unknown> | Search> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};
export class ListProductData {
  static filter(d?: Partial<ListProductsFilter>): ListProductsFilter {
    return {
      search: this.search(),
      page: 1,
      size: 10,
      sort: SORT_KEY.ASC,
      sort_by: SORT_BY[0],
      ...d
    };
  }

  static search(d?: DeepPartial<Search>): Search {
    const s: DeepPartial<Search> = {
      name: { eq: 'test' },
      ...d
    };
    return s as Search;
  }
}
