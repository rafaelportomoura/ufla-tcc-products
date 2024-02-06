import { isEmpty } from 'lodash';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { NotFoundError } from '../exceptions/NotFoundError';
import { ProductsRepository } from '../repositories/products';
import { GetProductArgs } from '../types/GetProduct';
import { Product } from '../types/Product';

export class GetProduct {
  private repository: ProductsRepository;

  private images_base_url: string;

  constructor({ logger, aws_params, images_base_url }: GetProductArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.images_base_url = images_base_url;
  }

  async get(_id: Product['_id'], projection: Partial<Record<keyof Product, number>> = {}): Promise<Product> {
    const product = await this.repository.findOne({ _id }, projection, { lean: true });

    if (isEmpty(product)) throw new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND);

    return this.repository.populateImagesBaseUrl(product, this.images_base_url);
  }
}
