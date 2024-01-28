import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { CreateProduct } from '../business/createProduct';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { create_product_schema } from '../schemas/createProduct';
import { CreateProductResponse } from '../types/CreateProduct';

export async function createProduct(req: FastifyRequest, res: FastifyReply): Promise<CreateProductResponse> {
  const logger = req.log;
  const validator = new Validator(create_product_schema);
  const body = await validator.validate(req.body);
  const business = new CreateProduct({
    stage: CONFIGURATION.STAGE,
    tenant: CONFIGURATION.TENANT,
    logger,
    topic: CONFIGURATION.EVENT_BUS,
    region: CONFIGURATION.REGION
  });
  const { _id } = await business.create(body);
  const response = {
    product_id: _id,
    ...CODE_MESSAGES.CREATE_PRODUCT
  };
  res.status(HTTP_STATUS_CODE.CREATED);
  return response;
}
