import { CODE_MESSAGES } from '../constants/codeMessages';
import { EVENT_STATUS, EVENT_TYPE } from '../constants/event';
import { ConflictError } from '../exceptions/ConflictError';
import { NotFoundError } from '../exceptions/NotFoundError';
import { ProductsRepository } from '../repositories/products';
import { EventBus } from '../services/EventBus';
import { EditProductArgs, EditProductPayload } from '../types/EditProduct';
import { Product } from '../types/Product';

export class EditProduct {
  private repository: ProductsRepository;

  private event_bus: EventBus;

  constructor(
    private product_id: Product['_id'],
    { logger, topic, region }: EditProductArgs
  ) {
    this.repository = new ProductsRepository({ region }, logger);
    this.event_bus = new EventBus(logger, topic, { region });
  }

  async edit(payload: EditProductPayload): Promise<Product> {
    if (payload.name) await this.checkAlreadyExist(payload.name);

    const product = await this.repository.edit(this.product_id, payload);

    if (!product) throw new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND);

    await this.sendEvent(product);

    return product;
  }

  async checkAlreadyExist(name: string): Promise<void> {
    const filter = {
      ...this.repository.alreadyExistFilter(name),
      ...this.repository.diffIdFilter(this.product_id)
    };
    const already_exists = await this.repository.findOne(filter, { _id: 1 }, { lean: true });

    if (already_exists) throw new ConflictError(CODE_MESSAGES.ALREADY_EXISTS_NAME);
  }

  async sendEvent(product: Product): Promise<void> {
    const event = this.event_bus.messageAttributes(EVENT_TYPE.EDIT, EVENT_STATUS.SUCCESS);
    return this.event_bus.pub(product, event);
  }
}
