import { Logger } from '../adapters/logger';
import { aws_config } from '../aws/config';
import { S3 } from '../aws/s3';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { CONFIGURATION } from '../constants/configuration';
import { NotFoundError } from '../exceptions/NotFoundError';
import { ProductsRepository } from '../repositories/products';
import { Product } from '../types/Product';
import { RemoveImageArgs } from '../types/RemoveImage';

export class RemoveImage {
  private repository: ProductsRepository;
  private logger: Logger;
  private s3: S3;
  private bucket: string;

  constructor({ logger, aws_params, bucket }: RemoveImageArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.s3 = new S3(aws_config(aws_params), logger);
    this.bucket = bucket;
  }

  async remove(_id: Product['_id'], image_id: Product['images'][number]): Promise<void> {
    const product = await this.repository.findOne({ _id }, { _id: 1, images: 1 }, { lean: true });

    if (!product) throw new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND);
    this.logger.debug('Product Found');
    if (!product.images?.includes(image_id)) throw new NotFoundError(CODE_MESSAGES.IMAGE_NOT_FOUND);
    this.logger.debug('Image Found');
    await this.s3.remove(this.bucket, `${CONFIGURATION.MICROSERVICE}/${_id}/${image_id}`);
    this.logger.debug('Image Removed');
    await this.repository.removeImage(_id, image_id);
    this.logger.debug('Image Removed from Product');
  }
}
