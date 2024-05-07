import '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { RemoveImage } from '../business/removeImage';
import { CONFIGURATION } from '../constants/configuration';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { remove_image_path_schema } from '../schemas/removeImage';
import { request_id } from '../utils/requestId';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function removeImage(req: FastifyRequest, res: FastifyReply): Promise<void | BaseError> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    const path_validator = new Validator(remove_image_path_schema);
    const { product_id, image_id } = await path_validator.validate(decodeObject(req.params));
    const remove_image_business = new RemoveImage({
      logger,
      aws_params: aws_config(),
      bucket: CONFIGURATION.BUCKET_NAME
    });
    await remove_image_business.remove(product_id, image_id as string);
    res.status(StatusCodes.NO_CONTENT);
    return res.send();
  } catch (error) {
    const response = error_handler(logger, error, 'addImage');
    res.status(response.status);
    return response;
  }
}
