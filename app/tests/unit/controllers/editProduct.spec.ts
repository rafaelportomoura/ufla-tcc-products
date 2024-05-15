import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { Validator } from '../../../src/adapters/validate';
import { EditProduct } from '../../../src/business/editProduct';
import { editProduct } from '../../../src/controllers/editProduct';
import { ValidationError } from '../../../src/exceptions/ValidationError';
import { EditProductPayload } from '../../../src/types/EditProduct';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';
import { ProductData } from '../../data/product';

describe('Controller -> EditProduct', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  let body: EditProductPayload;

  beforeEach(() => {
    sinon.restore();
    body = ProductData.edit();
    req = fastify_request({ body, params: { product_id: '12345' } });
    res = fastify_stub();
  });

  it('should return 204 if product is edited successfully', async () => {
    sinon.stub(Validator.prototype, 'validate').resolves(body);
    sinon.stub(EditProduct.prototype, 'edit').resolves();

    await editProduct(req as FastifyRequest, fastify_reply(res));

    expect(res.status.calledWith(StatusCodes.NO_CONTENT)).equal(true);
    expect(res.send.calledOnce).equal(true);
  });

  it('should handle validation errors', async () => {
    const result = await editProduct(req as FastifyRequest, fastify_reply(res));

    expect(result).to.be.instanceOf(ValidationError);
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });
});
