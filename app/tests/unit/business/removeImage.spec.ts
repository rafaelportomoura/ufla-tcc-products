/* eslint-disable dot-notation */
import { expect } from 'chai';
import sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { S3 } from '../../../src/aws/s3';
import { RemoveImage } from '../../../src/business/removeImage';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { CONFIGURATION } from '../../../src/constants/configuration';
import { NotFoundError } from '../../../src/exceptions/NotFoundError';
import { ProductsRepository } from '../../../src/repositories/products';
import { Product } from '../../../src/types/Product';
import { ProductData } from '../../data/product';

describe('Business -> RemoveImage', () => {
  let remove_image: RemoveImage;
  let repository_stub: sinon.SinonStubbedInstance<ProductsRepository>;
  let s3_stub: sinon.SinonStubbedInstance<S3>;
  let logger_stub: sinon.SinonStubbedInstance<Logger>;
  const aws_params = { region: 'us-east-1' };
  const bucket = 'test-bucket';

  beforeEach(() => {
    repository_stub = sinon.createStubInstance(ProductsRepository);
    s3_stub = sinon.createStubInstance(S3);
    logger_stub = sinon.createStubInstance(Logger);

    remove_image = new RemoveImage({ logger: logger_stub, aws_params, bucket });
    remove_image['repository'] = repository_stub;
    remove_image['s3'] = s3_stub;
  });

  it('should throw NotFoundError if product does not exist', async () => {
    repository_stub.findOne.resolves();
    const product_id = 'nonexistent_id';
    const image_id = 'image1.png';

    try {
      await remove_image.remove(product_id, image_id);
    } catch (error) {
      expect(error).instanceOf(NotFoundError);
      expect(error).deep.equal(new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND));
    }
  });

  it('should throw NotFoundError if image does not exist in product', async () => {
    const product: Product = ProductData.product({ images: ['i.png'] });
    repository_stub.findOne.resolves(product);
    const product_id = 'existing_id';
    const image_id = 'nonexistent_image.png';

    try {
      await remove_image.remove(product_id, image_id);
    } catch (error) {
      expect(error).instanceOf(NotFoundError);
      expect(error).deep.equal(new NotFoundError(CODE_MESSAGES.IMAGE_NOT_FOUND));
    }
  });

  it('should remove the image from S3 and the product', async () => {
    const product: Product = ProductData.product({ images: ['image1.png'] });
    repository_stub.findOne.resolves(product);
    s3_stub.remove.resolves();
    repository_stub.removeImage.resolves();

    const product_id = 'existing_id';
    const image_id = 'image1.png';

    await remove_image.remove(product_id, image_id);

    expect(s3_stub.remove.calledOnceWith(bucket, `${CONFIGURATION.MICROSERVICE}/${product_id}/${image_id}`)).equal(
      true
    );
    expect(repository_stub.removeImage.calledOnceWith(product_id, image_id)).equal(true);
    expect(logger_stub.debug.calledWith('Product Found')).equal(true);
    expect(logger_stub.debug.calledWith('Image Found')).equal(true);
    expect(logger_stub.debug.calledWith('Image Removed')).equal(true);
    expect(logger_stub.debug.calledWith('Image Removed from Product')).equal(true);
  });

  afterEach(() => {
    sinon.restore();
  });
});
