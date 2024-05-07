import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { GetProduct } from '../business/get';
import { CONFIGURATION } from '../constants/configuration';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { get_product_path_schema } from '../schemas/getProduct';
import { list_products_schema } from '../schemas/listProducts';
import { Product } from '../types/Product';
import { request_id } from '../utils/requestId';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function getProduct(req: FastifyRequest, res: FastifyReply): Promise<Product | BaseError> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    const path_validator = new Validator(get_product_path_schema);
    const { product_id } = await path_validator.validate(decodeObject(req.params));
    const query_validator = new Validator(list_products_schema);
    const { project } = await query_validator.validate(decodeObject(req.query));
    const business = new GetProduct({
      logger,
      aws_params: aws_config(),
      images_base_url: CONFIGURATION.IMAGES_URL
    });
    const response = await business.get(product_id, project);
    res.status(StatusCodes.OK);
    return response;
  } catch (error) {
    const response = error_handler(logger, error, 'addImage');
    res.status(response.status);
    return response;
  }
}
