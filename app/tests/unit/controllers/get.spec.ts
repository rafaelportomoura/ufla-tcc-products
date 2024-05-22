/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { Validator } from '../../../src/adapters/validate';
import { GetProduct } from '../../../src/business/get';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { getProduct } from '../../../src/controllers/get';
import { Product } from '../../../src/types/Product';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';
import { ProductData } from '../../data/product';

describe('Controller -> GetProduct', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  let product: Product;

  beforeEach(() => {
    sinon.restore();
    product = ProductData.product({ name: 'Test Product', price: 100 });
    req = fastify_request({ params: { product_id: '12345' }, query: { project: 'name price' } });
    res = fastify_stub();
  });

  it('should return 200 and product data if product is fetched successfully', async () => {
    sinon
      .stub(Validator.prototype, 'validate')
      .onFirstCall()
      .resolves({ product_id: '12345' })
      .onSecondCall()
      .resolves({ project: 'name price' });
    sinon.stub(GetProduct.prototype, 'get').resolves(product);

    const result = await getProduct(req as FastifyRequest, fastify_reply(res));

    expect(result).to.deep.equal(product);
    expect(res.status.calledWith(StatusCodes.OK)).equal(true);
    expect(res.send.calledOnce).equal(false);
  });

  it('should handle validation errors for params', async () => {
    req.body = {};

    const result = await getProduct(req as FastifyRequest, fastify_reply(res));

    expect((result as any).code).equal(CODE_MESSAGES.VALIDATION_ERROR.code);
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });
});
