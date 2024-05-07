import { aws_config } from '../aws/config';
import { S3 } from '../aws/s3';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { NotFoundError } from '../exceptions/NotFoundError';
import { ProductsRepository } from '../repositories/products';
import { AddImageArgs } from '../types/AddImage';
import { Product } from '../types/Product';

export class RemoveImage {
  private repository: ProductsRepository;

  private s3: S3;

  private bucket: string;

  constructor({ logger, aws_params, bucket }: AddImageArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.s3 = new S3(aws_config(aws_params), logger);
    this.bucket = bucket;
  }

  async remove(_id: Product['_id'], image_id: Product['images'][number]): Promise<void> {
    const product = await this.repository.findOne({ _id }, { _id: 1, images: 1 }, { lean: true });

    if (!product) throw new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND);

    if (!product.images?.includes(image_id)) throw new NotFoundError(CODE_MESSAGES.IMAGE_NOT_FOUND);

    await this.s3.remove(this.bucket, `${_id}/${image_id}`);

    await this.repository.removeImage(_id, image_id);
  }
}
