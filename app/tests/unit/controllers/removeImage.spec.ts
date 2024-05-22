/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { Validator } from '../../../src/adapters/validate';
import { RemoveImage } from '../../../src/business/removeImage';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { removeImage } from '../../../src/controllers/removeImage';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';

describe('Controller -> RemoveImage', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;

  beforeEach(() => {
    sinon.restore();
    req = fastify_request({ params: { product_id: '12345', image_id: 'image12345' } });
    res = fastify_stub();
  });

  it('should return 204 if image is removed successfully', async () => {
    sinon.stub(Validator.prototype, 'validate').resolves(req.params);
    sinon.stub(RemoveImage.prototype, 'remove').resolves();

    const result = await removeImage(req as FastifyRequest, fastify_reply(res));

    expect(result).equal(undefined);
    expect(res.status.calledWith(StatusCodes.NO_CONTENT)).equal(true);
    expect(res.send.calledOnce).equal(true);
  });

  it('should handle validation errors', async () => {
    req.params = { image_id: '/' };

    const result = await removeImage(req as FastifyRequest, fastify_reply(res));

    expect((result as any).code).equal(CODE_MESSAGES.VALIDATION_ERROR.code);
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });
});
