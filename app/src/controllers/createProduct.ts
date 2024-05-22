import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { CreateProduct } from '../business/createProduct';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { CONFIGURATION } from '../constants/configuration';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { create_product_schema } from '../schemas/createProduct';
import { CreateProductResponse } from '../types/CreateProduct';
import { request_id } from '../utils/requestId';

export async function createProduct(
  req: FastifyRequest,
  res: FastifyReply
): Promise<CreateProductResponse | ReturnType<BaseError['toJSON']>> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    const validator = new Validator(create_product_schema);
    const body = await validator.validate(req.body);
    const business = new CreateProduct({
      logger,
      topic: CONFIGURATION.EVENT_BUS,
      aws_params: aws_config()
    });
    const { _id } = await business.create(body);
    const response = {
      product_id: _id,
      ...CODE_MESSAGES.CREATE_PRODUCT
    };
    res.status(StatusCodes.CREATED);
    return response;
  } catch (error) {
    const response = error_handler(logger, error, 'CreateProduct');
    res.status(response.status);
    return response;
  }
}
