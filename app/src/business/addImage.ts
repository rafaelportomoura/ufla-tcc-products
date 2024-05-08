import { MultipartFile } from '@fastify/multipart';
import { createId } from '@paralleldrive/cuid2';
import sharp from 'sharp';
import { aws_config } from '../aws/config';
import { S3 } from '../aws/s3';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { ALLOWED_MIMETYPES } from '../constants/mimetype';
import { BadRequestError } from '../exceptions/BadRequestError';
import { NotFoundError } from '../exceptions/NotFoundError';
import { PayloadTooLargeError } from '../exceptions/PayloadTooLarge';
import { UnsupportedMediaTypeError } from '../exceptions/UnsupportedMediaType';
import { ProductsRepository } from '../repositories/products';
import { AddImageArgs } from '../types/AddImage';
import { Product } from '../types/Product';

export class AddImage {
  private repository: ProductsRepository;

  private s3: S3;

  private bucket: string;

  constructor({ logger, aws_params, bucket }: AddImageArgs) {
    this.repository = new ProductsRepository(aws_params, logger);
    this.s3 = new S3(aws_config(aws_params), logger);
    this.bucket = bucket;
  }

  async addImage(_id: Product['_id'], file: MultipartFile): Promise<string> {
    const product = await this.repository.findOne({ _id }, { _id: 1 }, { lean: true });

    if (!product) throw new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND);

    if (!file) throw new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED);

    if (file.file.truncated) {
      throw new PayloadTooLargeError(CODE_MESSAGES.IMAGE_IS_LARGER_THAN_FIVE_MEGABYTES);
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype))
      throw new UnsupportedMediaTypeError(CODE_MESSAGES.UNSUPPORTED_IMAGES_TYPE);

    const image_id = `${createId()}.png`;

    const buffer = await sharp(await file.toBuffer())
      .png()
      .toBuffer();

    await this.s3.upload(this.bucket, `${_id}/${image_id}`, buffer);

    await this.repository.addImage(_id, image_id);

    return image_id;
  }
}
