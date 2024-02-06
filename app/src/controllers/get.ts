import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { aws_params } from '../aws/config';
import { GetProduct } from '../business/get';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { get_product_path_schema } from '../schemas/getProduct';
import { list_products_schema } from '../schemas/listProducts';
import { Product } from '../types/Product';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function getProduct(req: FastifyRequest, res: FastifyReply): Promise<Product> {
  const logger = req.log;
  const path_validator = new Validator(get_product_path_schema);
  const { product_id } = await path_validator.validate(decodeObject(req.params));
  const query_validator = new Validator(list_products_schema);
  const { project } = await query_validator.validate(decodeObject(req.query));
  const business = new GetProduct({
    logger,
    aws_params: aws_params(),
    images_base_url: CONFIGURATION.IMAGES_URL
  });
  const response = await business.get(product_id, project);
  res.status(HTTP_STATUS_CODE.OK);
  return response;
}
