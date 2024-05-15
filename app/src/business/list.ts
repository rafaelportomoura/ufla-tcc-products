import { isEmpty } from 'lodash';
import { FilterQuery } from 'mongoose';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { OPERATORS_MAP_TO_MONGO, SORT } from '../constants/search';
import { BadRequestError } from '../exceptions/BadRequestError';
import { ProductsRepository } from '../repositories/products';
import { ListProductsArgs, ListProductsFilter, ListProductsOptions, ListProductsResponse } from '../types/ListProducts';
import { Product } from '../types/Product';

export class ListProducts {
  private repository: ProductsRepository;

  private images_base_url: string;

  constructor({ aws_params, logger, images_base_url }: ListProductsArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.images_base_url = images_base_url;
  }

  async get(filter: ListProductsFilter): Promise<ListProductsResponse> {
    const { project } = filter;
    const query = this.createQuery(filter);
    const options = this.createOptions(filter);

    const count = await this.repository.count(query);

    if (count < options.skip + 1) throw new BadRequestError(CODE_MESSAGES.INVALID_PAGE);

    const products = await this.repository.find(query, project, options);

    const pages = Math.ceil(count / filter.size);
    return {
      page: filter.page,
      pages,
      count,
      products: products.map((p) => this.repository.populateImagesBaseUrl(p, this.images_base_url))
    };
  }

  createQuery({ search }: ListProductsFilter): FilterQuery<Product> {
    const query: FilterQuery<Product> = {};

    if (isEmpty(search)) return query;

    for (const [key, filters] of Object.entries(search)) {
      query[key] = {};
      for (const [operator, value] of Object.entries(filters)) {
        query[key] = {
          ...query[key],
          ...OPERATORS_MAP_TO_MONGO[operator as keyof typeof OPERATORS_MAP_TO_MONGO](value as string)
        };
      }
    }

    return query;
  }

  createOptions({ sort: query_sort, sort_by, page, size }: ListProductsFilter): ListProductsOptions {
    const sort = { [sort_by]: SORT[query_sort] };
    const limit = size;
    const skip = (page - 1) * size;

    return { sort, limit, skip };
  }
}
