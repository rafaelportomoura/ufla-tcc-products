import { expect } from 'chai';
import { Model } from 'mongoose';
import sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { DocumentDatabase } from '../../../src/database/document';
import { ProductsRepository } from '../../../src/repositories/products';
import { Product } from '../../../src/types/Product';
import { ProductData } from '../../data/product';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let find_one_stub: sinon.SinonStub;
  let create_stub: sinon.SinonStub;
  let find_one_and_update: sinon.SinonStub;
  let count_documents: sinon.SinonStub;
  let find: sinon.SinonStub;
  let find_by_id_and_update: sinon.SinonStub;

  const logger = new Logger(LoggerLevel.silent, 'test-request-id');
  const aws_config = { region: 'us-east-1' };

  beforeEach(() => {
    sinon.restore();
    repository = new ProductsRepository(aws_config, logger);
    find_one_stub = sinon.stub(Model, 'findOne');
    create_stub = sinon.stub(Model, 'create');
    sinon.stub(DocumentDatabase.prototype, 'connect').resolves();
    find_one_and_update = sinon.stub(Model, 'findOneAndUpdate');
    count_documents = sinon.stub(Model, 'countDocuments');
    find = sinon.stub(Model, 'find');
    find_by_id_and_update = sinon.stub(Model, 'findByIdAndUpdate');
  });

  it('should create a product', async () => {
    const payload = ProductData.raw();
    const product = ProductData.product(payload);
    create_stub.resolves({
      toObject() {
        return product;
      }
    });

    const result = await repository.create(payload);

    expect(result).to.deep.equal(product);
    expect(create_stub.calledOnceWith(payload)).equal(true);
  });

  it('should edit a product', async () => {
    const product_id = '1';
    const edit_payload = ProductData.edit();
    const edited_product = ProductData.product(edit_payload);
    find_one_and_update.resolves(edited_product);

    const result = await repository.edit(product_id, edit_payload);

    expect(result).to.deep.equal(edited_product);
    expect(find_one_and_update.calledOnceWith({ _id: product_id }, edit_payload, { lean: true })).equal(true);
  });

  it('should count products', async () => {
    const query = { name: 'Test Product' };
    count_documents.resolves(5);

    const result = await repository.count(query);

    expect(result).to.equal(5);
    expect(count_documents.calledOnceWith(query)).equal(true);
  });

  it('should find products', async () => {
    const query = { price: { $gt: 50 } };
    const products: Product[] = [ProductData.product()];
    find.resolves(products);

    const result = await repository.find(query, {}, { lean: true });

    expect(result).to.deep.equal(products);
    expect(find.calledOnceWith(query, {}, { lean: true })).equal(true);
  });

  it('should find products', async () => {
    const query = { price: { $gt: 50 } };
    const products: Product[] = [ProductData.product()];
    find.resolves(
      products.map((v) => ({
        toObject() {
          return v;
        }
      }))
    );

    const result = await repository.find(query);

    expect(result).to.deep.equal(products);
    expect(find.calledOnceWith(query, {})).equal(true);
  });

  it('should find one product', async () => {
    const query = { _id: '1' };
    const product = ProductData.product();
    find_one_stub.resolves(product);

    const result = await repository.findOne(query, {}, { lean: true });

    expect(result).to.deep.equal(product);
    expect(find_one_stub.calledOnceWith(query, {}, { lean: true })).equal(true);
  });

  it('should find one product', async () => {
    const query = { _id: '1' };
    const product = ProductData.product();
    find_one_stub.resolves({
      toObject() {
        return product;
      }
    });

    const result = await repository.findOne(query);

    expect(result).to.deep.equal(product);
    expect(find_one_stub.calledOnceWith(query, {}, {})).equal(true);
  });

  it('should add an image to a product', async () => {
    const product_id = '1';
    const image_id = 'image1';
    const product = ProductData.product({ images: [image_id] });
    find_by_id_and_update.resolves(product);

    const result = await repository.addImage(product_id, image_id);

    expect(result).to.deep.equal(product);
    expect(find_by_id_and_update.calledOnceWith(product_id, { $push: { images: image_id } }, { lean: true })).equal(
      true
    );
  });

  it('should remove an image from a product', async () => {
    const product_id = '1';
    const image_id = 'image1';
    const product: Product = ProductData.product({ images: [] });
    find_by_id_and_update.resolves(product);

    const result = await repository.removeImage(product_id, image_id);

    expect(result).to.deep.equal(product);
    expect(
      find_by_id_and_update.calledOnceWith(product_id, { $pull: { images: { $eq: image_id } } }, { lean: true })
    ).equal(true);
  });

  it('should apply alreadyExistFilter', () => {
    const name = 'Test Product';
    const result = repository.alreadyExistFilter(name);
    expect(result).to.deep.equal({ name });
  });

  it('should apply diffIdFilter', () => {
    const id = '1';
    const result = repository.diffIdFilter(id);
    expect(result).to.deep.equal({ _id: { $ne: id } });
  });

  it('should populate images base URL', () => {
    const product: Product = ProductData.product({ images: ['image1', 'image2'] });
    const base_url = 'http://example.com';
    const expected_product = {
      ...product,
      images: [`http://example.com/products/${product._id}/image1`, `http://example.com/products/${product._id}/image2`]
    };

    const result = repository.populateImagesBaseUrl(product, base_url);

    expect(result).to.deep.equal(expected_product);
  });
  it('should skip populate images base URL', () => {
    const product: Product = ProductData.product({ images: [] });

    const expected_product = {
      ...product,
      images: []
    };

    const result = repository.populateImagesBaseUrl(product, 'x');

    expect(result).to.deep.equal(expected_product);
  });
});
