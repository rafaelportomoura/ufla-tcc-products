import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { Validator } from '../../../src/adapters/validate';
import { AddImage } from '../../../src/business/addImage';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { addImage } from '../../../src/controllers/addImage';
import { BadRequestError } from '../../../src/exceptions/BadRequestError';
import { add_image_path_schema } from '../../../src/schemas/addImage';
import { fastify_request } from '../../data/fastify';

describe('addImage controller', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  let validator_stub: sinon.SinonStubbedInstance<Validator<typeof add_image_path_schema>>;
  let add_image_business_stub: sinon.SinonStubbedInstance<AddImage>;

  beforeEach(() => {
    sinon.restore();
    req = fastify_request({
      isMultipart: sinon.stub().returns(true),
      file: sinon.stub(),
      params: { product_id: '12345' }
    });

    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub()
    } as unknown as Record<keyof FastifyReply, sinon.SinonStub>;
  });

  it('should return 400 if request is not multipart', async () => {
    req.isMultipart = sinon.stub().returns(false);

    const result = await addImage(req as FastifyRequest, res as unknown as FastifyReply);

    expect(result).instanceOf(BadRequestError);
    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED));
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 400 if no file is provided', async () => {
    req.file = sinon.stub().resolves(null);

    const result = await addImage(req as FastifyRequest, res as unknown as FastifyReply);

    expect(result).instanceOf(BadRequestError);
    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED));
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 400 if fieldname is not "image"', async () => {
    req.file = sinon.stub().resolves({ fieldname: 'wrong_field' });

    const result = await addImage(req as FastifyRequest, res as unknown as FastifyReply);

    expect(result).instanceOf(BadRequestError);
    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.JUST_IMAGE_FIELD_IS_ALLOWED));
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 201 and image_id if image is added successfully', async () => {
    const file = { fieldname: 'image' };
    req.file = sinon.stub().resolves(file);

    sinon.stub(Validator.prototype, 'validate').resolves({ product_id: '12345' });
    sinon.stub(AddImage.prototype, 'addImage').resolves('image12345');

    const result = await addImage(req as FastifyRequest, res as unknown as FastifyReply);

    expect(result).deep.equal({ image_id: 'image12345' });
    expect(res.status.calledWith(StatusCodes.CREATED)).equal(true);
  });
});
