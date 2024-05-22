import { expect } from 'chai';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import sinon from 'sinon';
import { CreateProduct } from '../../../src/business/createProduct';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { createProduct } from '../../../src/controllers/createProduct';
import { CreateProductPayload } from '../../../src/types/CreateProduct';
import { fastify_reply, fastify_request, fastify_stub } from '../../data/fastify';
import { ProductData } from '../../data/product';

describe('Controller -> CreateProduct', () => {
  let req: Partial<FastifyRequest>;
  let res: Record<keyof FastifyReply, sinon.SinonStub>;
  let body: CreateProductPayload;

  beforeEach(() => {
    sinon.restore();
    body = ProductData.create();
    req = fastify_request({ body });
    res = fastify_stub();
  });

  it('should return 201 and product_id if product is created successfully', async () => {
    const product = ProductData.product(body);
    sinon.stub(CreateProduct.prototype, 'create').resolves(product);
    const result = await createProduct(req as FastifyRequest, fastify_reply(res));
    expect(result).to.deep.equal({ product_id: product._id, ...CODE_MESSAGES.CREATE_PRODUCT });
    expect(res.status.calledWith(StatusCodes.CREATED)).equal(true);
  });

  it('should handle validation errors', async () => {
    req.body = ProductData.create({ name: undefined });
    const result = await createProduct(req as FastifyRequest, fastify_reply(res));

    expect(res.status.calledWith(StatusCodes.BAD_REQUEST)).equal(true);
    expect(result.code).equal(CODE_MESSAGES.VALIDATION_ERROR.code);
  });
});
