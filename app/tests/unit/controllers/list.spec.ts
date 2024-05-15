import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { ListProducts } from '../../../src/business/list';
import { listProducts } from '../../../src/controllers/list';
import { ValidationError } from '../../../src/exceptions/ValidationError';
import { ListProductsResponse } from '../../../src/types/ListProducts';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';
import { ListProductData } from '../../data/list';
import { ProductData } from '../../data/product';

describe('Controller -> ListProducts', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  let response: ListProductsResponse;

  beforeEach(() => {
    sinon.restore();
    response = {
      page: 1,
      pages: 1,
      count: 1,
      products: [ProductData.product({ name: 'Test Product', price: 100 })]
    };
    req = fastify_request({ query: ListProductData.filter() });
    res = fastify_stub();
  });

  it('should return 200 and product list if products are listed successfully', async () => {
    sinon.stub(ListProducts.prototype, 'get').resolves(response);

    const result = await listProducts(req as FastifyRequest, fastify_reply(res));

    expect(result).to.deep.equal(response);
    expect(res.status.calledWith(StatusCodes.OK)).equal(true);
    expect(res.send.calledOnce).equal(false);
  });

  it('should handle validation errors', async () => {
    req.query = { page: 'invalid' };

    const result = await listProducts(req as FastifyRequest, fastify_reply(res));

    expect(result).instanceOf(ValidationError);
    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
  });
});
