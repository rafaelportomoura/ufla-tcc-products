/* eslint-disable dot-notation */
import { expect } from 'chai';
import { FilterQuery } from 'mongoose';
import sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { ListProducts } from '../../../src/business/list';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { OPERATORS_MAP_TO_MONGO, SORT } from '../../../src/constants/search';
import { BadRequestError } from '../../../src/exceptions/BadRequestError';
import { ProductsRepository } from '../../../src/repositories/products';
import { ListProductsFilter, ListProductsOptions, ListProductsResponse } from '../../../src/types/ListProducts';
import { Product } from '../../../src/types/Product';
import { ListProductData } from '../../data/list';
import { ProductData } from '../../data/product';

describe('Business - ListProducts', () => {
  let list_products: ListProducts;
  let repository_stub: sinon.SinonStubbedInstance<ProductsRepository>;
  const aws_params = { region: 'us-east-1' };
  const logger = new Logger(LoggerLevel.silent, 'test');
  const images_base_url = 'http://example.com/images/';

  beforeEach(() => {
    sinon.restore();
    repository_stub = sinon.createStubInstance(ProductsRepository);
    list_products = new ListProducts({ aws_params, logger, images_base_url });

    list_products['repository'] = repository_stub;
  });

  it('should return paginated products', async () => {
    const filter: ListProductsFilter = ListProductData.filter({ search: undefined });
    const query: FilterQuery<Product> = {};
    const options: ListProductsOptions = { sort: { name: 1 }, limit: 10, skip: 0 };
    const count = 20;
    const images = ['image1.png'];
    const products: Product[] = [ProductData.product({ images })];

    repository_stub.count.resolves(count);
    repository_stub.find.resolves(products);
    repository_stub.populateImagesBaseUrl.callsFake((p) => ({
      ...p,
      images: images.map((i) => `${images_base_url}${i}`)
    }));

    const response: ListProductsResponse = await list_products.get(filter);

    expect(response.page).equal(1);
    expect(response.pages).equal(2);
    expect(response.count).equal(count);
    expect(response.products).deep.equal(products.map((p) => ({ ...p, images: [`${images_base_url}${p.images[0]}`] })));
    expect(repository_stub.count.calledOnceWith(query)).equal(true);
    expect(repository_stub.find.calledOnceWith(query, filter.project, options)).equal(true);
  });

  it('should throw BadRequestError if requested page is invalid', async () => {
    const filter: ListProductsFilter = ListProductData.filter({ search: undefined, page: 3, size: 10 });
    const count = 20;

    repository_stub.count.resolves(count);

    try {
      await list_products.get(filter);
    } catch (error) {
      expect(error).instanceOf(BadRequestError);
      expect(error).deep.equal(new BadRequestError(CODE_MESSAGES.INVALID_PAGE));
    }
  });

  it('should create a valid query from filters', () => {
    const filter: ListProductsFilter = ListProductData.filter({
      search: ListProductData.search({ name: { eq: 'p' } })
    });
    const expected_query: FilterQuery<Product> = {
      name: {
        ...OPERATORS_MAP_TO_MONGO['eq']('p')
      }
    };

    const query = list_products.createQuery(filter);

    expect(query).deep.equal(expected_query);
  });

  it('should create valid options from filters', () => {
    const filter: ListProductsFilter = ListProductData.filter({ page: 2, size: 10, sort: 'asc', sort_by: 'name' });
    const expected_options: ListProductsOptions = {
      sort: { name: SORT['asc'] },
      limit: 10,
      skip: 10
    };

    const options = list_products.createOptions(filter);

    expect(options).deep.equal(expected_options);
  });
});
