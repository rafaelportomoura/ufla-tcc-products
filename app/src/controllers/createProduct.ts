import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { aws_params } from '../aws/config';
import { CreateProduct } from '../business/createProduct';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { create_product_schema } from '../schemas/createProduct';
import { CreateProductPayload, CreateProductResponse } from '../types/CreateProduct';

export async function createProduct(req: FastifyRequest, res: FastifyReply): Promise<CreateProductResponse> {
  const logger = req.log;
  const validator = new Validator(create_product_schema);
  const body = await validator.validate(req.body);
  const business = new CreateProduct({
    logger,
    topic: CONFIGURATION.EVENT_BUS,
    aws_params: aws_params()
  });
  const { _id } = await business.create(body as CreateProductPayload);
  const response = {
    product_id: _id,
    ...CODE_MESSAGES.CREATE_PRODUCT
  };
  res.status(HTTP_STATUS_CODE.CREATED);
  return response;
}
