/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { MultipartFile } from '@fastify/multipart';
import { expect } from 'chai';
import sharp from 'sharp';
import Sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { S3 } from '../../../src/aws/s3';
import { AddImage } from '../../../src/business/addImage';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { LoggerLevel } from '../../../src/constants/loggerLevel';
import { ALLOWED_MIMETYPES } from '../../../src/constants/mimetype';
import { BadRequestError } from '../../../src/exceptions/BadRequestError';
import { NotFoundError } from '../../../src/exceptions/NotFoundError';
import { PayloadTooLargeError } from '../../../src/exceptions/PayloadTooLarge';
import { UnsupportedMediaTypeError } from '../../../src/exceptions/UnsupportedMediaType';
import { ProductsRepository } from '../../../src/repositories/products';
import { ProductData } from '../../data/product';

describe('Business -> AddImage', () => {
  let add_image: AddImage;
  let repository_stub: Sinon.SinonStubbedInstance<ProductsRepository>;
  let s3_stub: Sinon.SinonStubbedInstance<S3>;
  const bucket = 'test-bucket';
  const aws_params = { region: 'us-east-1' };
  const logger = new Logger(LoggerLevel.silent, 'test');

  beforeEach(() => {
    Sinon.restore();
    repository_stub = Sinon.createStubInstance(ProductsRepository);
    s3_stub = Sinon.createStubInstance(S3);
    add_image = new AddImage({ logger, aws_params, bucket });

    add_image['repository'] = repository_stub;

    add_image['s3'] = s3_stub;
  });

  it('should throw NotFoundError if product does not exist', async () => {
    repository_stub.findOne.resolves();
    const file: Partial<MultipartFile> = {};

    try {
      await add_image.addImage('nonexistent_id', file as MultipartFile);
    } catch (error) {
      expect(error).instanceOf(NotFoundError);
      expect(error).deep.equal(new NotFoundError(CODE_MESSAGES.PRODUCT_NOT_FOUND));
    }
  });

  it('should throw BadRequestError if file is not provided', async () => {
    repository_stub.findOne.resolves(ProductData.product());

    try {
      await add_image.addImage('valid_id', null as any);
    } catch (error) {
      expect(error).instanceOf(BadRequestError);
      expect(error).deep.equal(new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED));
    }
  });

  it('should throw PayloadTooLargeError if file is truncated', async () => {
    repository_stub.findOne.resolves(ProductData.product());
    const file: Partial<MultipartFile> = { file: { truncated: true } as any };

    try {
      await add_image.addImage('valid_id', file as MultipartFile);
    } catch (error) {
      expect(error).instanceOf(PayloadTooLargeError);
      expect(error).deep.equal(new PayloadTooLargeError(CODE_MESSAGES.IMAGE_IS_LARGER_THAN_FIVE_MEGABYTES));
    }
  });

  it('should throw UnsupportedMediaTypeError if mimetype is not allowed', async () => {
    repository_stub.findOne.resolves(ProductData.product());
    const file: Partial<MultipartFile> = { mimetype: 'image/gif', file: { truncated: false } as any };
    try {
      await add_image.addImage('valid_id', file as MultipartFile);
    } catch (error) {
      expect(error).instanceOf(UnsupportedMediaTypeError);
      expect(error).deep.equal(new UnsupportedMediaTypeError(CODE_MESSAGES.UNSUPPORTED_IMAGES_TYPE));
    }
  });

  it('should upload image and return image_id', async () => {
    repository_stub.findOne.resolves(ProductData.product());
    const file: Partial<MultipartFile> = {
      mimetype: ALLOWED_MIMETYPES[0],
      toBuffer: Sinon.stub().resolves(Buffer.from('test')),
      file: { truncated: false } as any
    };
    const buffer = Buffer.from('test');
    Sinon.stub(sharp.prototype, 'toBuffer').resolves(buffer);
    s3_stub.upload.resolves();

    const image_id = await add_image.addImage('valid_id', file as MultipartFile);

    expect(image_id)
      .a('string')
      .and.to.match(/\.png$/);

    expect(s3_stub.upload.calledOnce).equal(true);
    expect(repository_stub.addImage.calledOnce).equal(true);
  });

  afterEach(() => {
    Sinon.restore();
  });
});
