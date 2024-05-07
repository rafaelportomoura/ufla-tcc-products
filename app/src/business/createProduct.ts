import { CODE_MESSAGES } from '../constants/codeMessages';
import { EVENT_STATUS, EVENT_TYPE } from '../constants/event';
import { ConflictError } from '../exceptions/ConflictError';
import { ProductsRepository } from '../repositories/products';
import { EventBus } from '../services/EventBus';
import { CreateProductArgs, CreateProductPayload, RawProduct } from '../types/CreateProduct';
import { Product } from '../types/Product';

export class CreateProduct {
  private repository: ProductsRepository;

  private event_bus: EventBus;

  constructor({ logger, topic, aws_params }: CreateProductArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.event_bus = new EventBus(logger, topic, aws_params);
  }

  async create(payload: CreateProductPayload): Promise<Product> {
    const already_exists = await this.repository.findOne(
      this.repository.alreadyExistFilter(payload.name),
      { _id: 1 },
      { lean: true }
    );

    if (already_exists) throw new ConflictError(CODE_MESSAGES.ALREADY_EXISTS_NAME);

    const product = await this.repository.create(this.generate(payload));

    await this.sendEvent(product);

    return product;
  }

  generate(payload: CreateProductPayload): RawProduct {
    return {
      ...payload,
      images: []
    };
  }

  async sendEvent(product: Product): Promise<void> {
    const event = this.event_bus.messageAttributes(EVENT_TYPE.CREATE, EVENT_STATUS.SUCCESS);
    return this.event_bus.pub(product, event);
  }
}
