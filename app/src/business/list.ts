import { isEmpty } from 'lodash';
import { FilterQuery } from 'mongoose';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { OPERATORS_MAP_TO_MONGO, ORDER } from '../constants/search';
import { BadRequestError } from '../exceptions/BadRequestError';
import { ProductsRepository } from '../repositories/products';
import { ListProductsArgs, ListProductsFilter, ListProductsOptions, ListProductsResponse } from '../types/ListProducts';
import { Product } from '../types/Product';

export class ListProducts {
  private repository: ProductsRepository;

  constructor({ aws_params, logger }: ListProductsArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
  }

  async get(filter: ListProductsFilter): Promise<ListProductsResponse> {
    const { project } = filter;
    const query = this.createQuery(filter);
    const options = this.createOptions(filter);

    const count = await this.repository.count(query);

    if (count < options.skip) throw new BadRequestError(CODE_MESSAGES.INVALID_PAGE);

    const products = await this.repository.find(query, project, options);

    const pages = Math.ceil(count / filter.size);
    return {
      page: filter.page,
      pages,
      count,
      products
    };
  }

  createQuery({ search }: ListProductsFilter): FilterQuery<Product> {
    console.log(search);
    const query: FilterQuery<Product> = {};

    if (isEmpty(search)) return query;

    for (const [key, filters] of Object.entries(search)) {
      query[key] = {};
      for (const [operator, value] of Object.entries(filters)) {
        query[key] = {
          ...query[key],
          ...OPERATORS_MAP_TO_MONGO[operator as keyof typeof OPERATORS_MAP_TO_MONGO](value)
        };
      }
    }

    return query;
  }

  createOptions({ order, order_by, page, size }: ListProductsFilter): ListProductsOptions {
    const sort = { [order_by]: ORDER[order] };
    const limit = size;
    const skip = (page - 1) * size;

    return { sort, limit, skip };
  }
}
