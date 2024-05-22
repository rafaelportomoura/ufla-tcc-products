import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { ListProducts } from '../business/list';
import { CONFIGURATION } from '../constants/configuration';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { list_products_schema } from '../schemas/listProducts';
import { ListProductsResponse } from '../types/ListProducts';
import { request_id } from '../utils/requestId';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function listProducts(
  req: FastifyRequest,
  res: FastifyReply
): Promise<ListProductsResponse | ReturnType<BaseError['toJSON']>> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    const raw_query = decodeObject(req.query);
    const validator = new Validator(list_products_schema);
    const query = await validator.validate(raw_query);
    const business = new ListProducts({
      logger,
      aws_params: aws_config(),
      images_base_url: CONFIGURATION.IMAGES_URL
    });
    const response = await business.get(query);
    res.status(StatusCodes.OK);
    return response;
  } catch (error) {
    const response = error_handler(logger, error, 'ListProduct');
    res.status(response.status);
    return response;
  }
}
