/* eslint-disable dot-notation */
import { expect } from 'chai';
import Sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { CreateProduct } from '../../../src/business/createProduct';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { EVENT_STATUS, EVENT_TYPE } from '../../../src/constants/event';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { ConflictError } from '../../../src/exceptions/ConflictError';
import { ProductsRepository } from '../../../src/repositories/products';
import { EventBus } from '../../../src/services/EventBus';
import { CreateProductPayload, RawProduct } from '../../../src/types/CreateProduct';
import { Product } from '../../../src/types/Product';
import { EventBusData } from '../../data/eventBus';
import { ProductData } from '../../data/product';

describe('Business -> CreateProduct', () => {
  let create_product: CreateProduct;
  let repository_stub: Sinon.SinonStubbedInstance<ProductsRepository>;
  let event_bus_stub: Sinon.SinonStubbedInstance<EventBus>;
  const logger = new Logger(LoggerLevel.silent, 'test');
  const topic = 'test-topic';
  const aws_params = { region: 'us-east-1' };

  beforeEach(() => {
    Sinon.restore();
    repository_stub = Sinon.createStubInstance(ProductsRepository);
    event_bus_stub = Sinon.createStubInstance(EventBus);
    create_product = new CreateProduct({ logger, topic, aws_params });
    create_product['repository'] = repository_stub;
    create_product['event_bus'] = event_bus_stub;
  });

  it('should throw ConflictError if product already exists', async () => {
    repository_stub.findOne.resolves(ProductData.product());
    const payload: CreateProductPayload = ProductData.create();

    try {
      await create_product.create(payload);
    } catch (error) {
      expect(error).to.be.instanceOf(ConflictError);
      expect(error).deep.equal(new ConflictError(CODE_MESSAGES.ALREADY_EXISTS_NAME));
    }
  });

  it('should create a new product and send an event', async () => {
    repository_stub.findOne.resolves();
    const payload: CreateProductPayload = ProductData.create();
    const created_product: Product = ProductData.product(payload);

    repository_stub.create.resolves(created_product);
    event_bus_stub.pub.resolves();

    const product = await create_product.create(payload);

    expect(product).deep.equal(created_product);
    expect(repository_stub.create.calledOnce).equal(true);
    expect(event_bus_stub.pub.calledOnce).equal(true);
  });

  it('should generate a raw product', () => {
    const payload: CreateProductPayload = ProductData.create();
    const raw_product: RawProduct = create_product.generate(payload);

    expect(raw_product).deep.equal({ ...payload, images: [] });
  });

  it('should send an event', async () => {
    const product: Product = ProductData.product();
    const event_attributes = EventBusData.messageAttributes(EVENT_TYPE.CREATE, EVENT_STATUS.SUCCESS);

    event_bus_stub.messageAttributes.returns(event_attributes);
    event_bus_stub.pub.resolves();

    await create_product.sendEvent(product);

    expect(event_bus_stub.messageAttributes.calledOnceWith(EVENT_TYPE.CREATE, EVENT_STATUS.SUCCESS)).equal(true);
    expect(event_bus_stub.pub.calledOnceWith(product, event_attributes)).equal(true);
  });
});
