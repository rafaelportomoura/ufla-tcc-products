/* eslint-disable dot-notation */
import { expect } from 'chai';
import sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { EditProduct } from '../../../src/business/editProduct';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { EVENT_STATUS, EVENT_TYPE } from '../../../src/constants/event';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { ConflictError } from '../../../src/exceptions/ConflictError';
import { NotFoundError } from '../../../src/exceptions/NotFoundError';
import { ProductsRepository } from '../../../src/repositories/products';
import { EventBus } from '../../../src/services/EventBus';
import { EditProductPayload } from '../../../src/types/EditProduct';
import { Product } from '../../../src/types/Product';
import { EventBusData } from '../../data/eventBus';
import { ProductData } from '../../data/product';

describe('Business -> EditProduct', () => {
  let edit_product: EditProduct;
  let repository_stub: sinon.SinonStubbedInstance<ProductsRepository>;
  let event_bus_stub: sinon.SinonStubbedInstance<EventBus>;
  const logger = new Logger(LoggerLevel.silent, 'test');
  const topic = 'test-topic';
  const aws_params = { region: 'us-east-1' };
  const product_id = 'test_product_id';

  beforeEach(() => {
    sinon.restore();
    repository_stub = sinon.createStubInstance(ProductsRepository);
    event_bus_stub = sinon.createStubInstance(EventBus);
    edit_product = new EditProduct(product_id, { logger, topic, aws_params });

    edit_product['repository'] = repository_stub;

    edit_product['event_bus'] = event_bus_stub;
  });

  it('should throw ConflictError if product with new name already exists', async () => {
    const payload: EditProductPayload = ProductData.edit();
    repository_stub.findOne.resolves(ProductData.product());

    try {
      await edit_product.edit(payload);
    } catch (error) {
      expect(error).instanceOf(ConflictError);
      expect(error).deep.equal(new ConflictError(CODE_MESSAGES.ALREADY_EXISTS_NAME));
    }
  });

  it('should throw NotFoundError if product to edit does not exist', async () => {
    const payload: EditProductPayload = { name: 'new_name' };
    repository_stub.findOne.resolves();

    try {
      await edit_product.edit(payload);
    } catch (error) {
      expect(error).instanceOf(NotFoundError);
      expect(error).deep.equal(new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND));
    }
  });

  it('should edit an existing product and send an event', async () => {
    const payload: EditProductPayload = ProductData.edit();
    const edited_product: Product = ProductData.product(payload);

    repository_stub.findOne.resolves();
    repository_stub.edit.resolves(edited_product);
    event_bus_stub.pub.resolves();

    const product = await edit_product.edit(payload);

    expect(product).deep.equal(edited_product);
    expect(repository_stub.edit.calledOnceWith(product_id, payload)).equal(true);
    expect(event_bus_stub.pub.calledOnce).equal(true);
  });

  it('should send an event after editing a product', async () => {
    const product: Product = ProductData.product();
    const event_attributes = EventBusData.messageAttributes(EVENT_TYPE.EDIT, EVENT_STATUS.SUCCESS);

    event_bus_stub.messageAttributes.returns(event_attributes);
    event_bus_stub.pub.resolves();

    await edit_product.sendEvent(product);

    expect(event_bus_stub.messageAttributes.calledOnceWith(EVENT_TYPE.EDIT, EVENT_STATUS.SUCCESS)).equal(true);
    expect(event_bus_stub.pub.calledOnceWith(product, event_attributes)).equal(true);
  });
});
