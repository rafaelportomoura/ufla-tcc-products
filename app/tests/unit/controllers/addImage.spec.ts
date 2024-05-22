import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { AddImage } from '../../../src/business/addImage';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { addImage } from '../../../src/controllers/addImage';
import { BadRequestError } from '../../../src/exceptions/BadRequestError';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';
import { ProductData } from '../../data/product';

describe('Controller -> AddImage', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  beforeEach(() => {
    sinon.restore();
    req = fastify_request({
      isMultipart: sinon.stub().returns(true),
      file: sinon.stub(),
      params: { product_id: ProductData._id() }
    });

    res = fastify_stub();
  });

  it('should return 400 if request is not multipart', async () => {
    req.isMultipart = sinon.stub().returns(false);

    const result = await addImage(req as FastifyRequest, fastify_reply(res));

    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED).toJSON());
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 400 if no file is provided', async () => {
    req.file = sinon.stub().resolves(null);

    const result = await addImage(req as FastifyRequest, fastify_reply(res));

    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED).toJSON());
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 400 if fieldname is not "image"', async () => {
    req.file = sinon.stub().resolves({ fieldname: 'wrong_field' });

    const result = await addImage(req as FastifyRequest, fastify_reply(res));

    expect(result).deep.equal(new BadRequestError(CODE_MESSAGES.JUST_IMAGE_FIELD_IS_ALLOWED).toJSON());
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });

  it('should return 201 and image_id if image is added successfully', async () => {
    const file = { fieldname: 'image' };
    req.file = sinon.stub().resolves(file);

    sinon.stub(AddImage.prototype, 'addImage').resolves('image12345');

    const result = await addImage(req as FastifyRequest, fastify_reply(res));

    expect(result).deep.equal({ image_id: 'image12345' });
    expect(res.status.calledWith(StatusCodes.CREATED)).equal(true);
  });
});
