import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { EditProduct } from '../business/editProduct';
import { CONFIGURATION } from '../constants/configuration';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { edit_product_schema } from '../schemas/editProduct';
import { request_id } from '../utils/requestId';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function editProduct(req: FastifyRequest, res: FastifyReply): Promise<void | BaseError> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    logger.info('EditProduct', decodeObject(req.params));
    const product_id = decodeURIComponent((req.params as Record<string, string>).product_id);
    const validator = new Validator(edit_product_schema);
    const body = await validator.validate(req.body);
    const business = new EditProduct(product_id, {
      logger,
      topic: CONFIGURATION.EVENT_BUS,
      aws_params: aws_config()
    });
    await business.edit(body);
    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    const response = error_handler(logger, error, 'EditProduct');
    res.status(response.status);
    return response;
  }
}
