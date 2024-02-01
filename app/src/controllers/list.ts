import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { ListProducts } from '../business/list';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { list_products_schema } from '../schemas/listProducts';
import { ListProductsResponse } from '../types/ListProducts';
import { decodeObject } from '../utils/uriDecodeComponent';

// Add the following import
export async function listProducts(req: FastifyRequest, res: FastifyReply): Promise<ListProductsResponse> {
  const logger = req.log;
  const raw_query = decodeObject(req.query);
  const validator = new Validator(list_products_schema);
  const query = await validator.validate(raw_query);
  const business = new ListProducts({ logger, aws_params: { region: CONFIGURATION.REGION } });
  const response = await business.get(query);
  res.status(HTTP_STATUS_CODE.OK);
  return response;
}
