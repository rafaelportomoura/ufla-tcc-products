/* eslint-disable dot-notation */
import { expect } from 'chai';
import sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { GetProduct } from '../../../src/business/get';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { NotFoundError } from '../../../src/exceptions/NotFoundError';
import { ProductsRepository } from '../../../src/repositories/products';
import { Product } from '../../../src/types/Product';
import { ProductData } from '../../data/product';

describe('Business -> GetProduct', () => {
  let get_product: GetProduct;
  let repository_stub: sinon.SinonStubbedInstance<ProductsRepository>;
  const logger = new Logger(LoggerLevel.silent, 'test');
  const aws_params = { region: 'us-east-1' };
  const images_base_url = 'http://example.com/images/';

  beforeEach(() => {
    sinon.restore();
    repository_stub = sinon.createStubInstance(ProductsRepository);
    get_product = new GetProduct({ logger, aws_params, images_base_url });

    get_product['repository'] = repository_stub;
  });

  it('should throw NotFoundError if product does not exist', async () => {
    repository_stub.findOne.resolves();
    const product_id = 'nonexistent_id';

    try {
      await get_product.get(product_id);
    } catch (error) {
      expect(error).instanceOf(NotFoundError);
      expect(error).deep.equal(new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND));
    }
  });

  it('should return product with populated image URLs', async () => {
    const product_id = 'existing_id';
    const product: Product = ProductData.product({ images: ['image1.png'] });
    const populated_product = ProductData.product({ images: [`${images_base_url}image1.png`] });

    repository_stub.findOne.resolves(product);
    repository_stub.populateImagesBaseUrl.resolves(populated_product);

    const result = await get_product.get(product_id);

    expect(result).to.deep.equal(populated_product);
    expect(repository_stub.findOne.calledOnceWith({ _id: product_id }, {}, { lean: true })).equal(true);
    expect(repository_stub.populateImagesBaseUrl.calledOnceWith(product, images_base_url)).equal(true);
  });
});
