import '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../adapters/logger';
import { Validator } from '../adapters/validate';
import { aws_config } from '../aws/config';
import { AddImage } from '../business/addImage';
import { CODE_MESSAGES } from '../constants/codeMessages';
import { CONFIGURATION } from '../constants/configuration';
import { BadRequestError } from '../exceptions/BadRequestError';
import { BaseError } from '../exceptions/BaseError';
import { error_handler } from '../middlewares/error';
import { add_image_path_schema } from '../schemas/addImage';
import { AddImageResponse } from '../types/AddImage';
import { request_id } from '../utils/requestId';
import { decodeObject } from '../utils/uriDecodeComponent';

const options = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
    fields: 1,
    fieldNameSize: 250,
    parts: 1
  }
};

export async function addImage(req: FastifyRequest, res: FastifyReply): Promise<AddImageResponse | BaseError> {
  const logger = new Logger(CONFIGURATION.LOG_LEVEL, request_id(req));
  try {
    logger.debug('AddImage', decodeObject(req.params));
    if (!req.isMultipart()) throw new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED);
    const data = await req.file(options);
    if (!data) throw new BadRequestError(CODE_MESSAGES.IMAGE_IS_REQUIRED);
    if (data.fieldname !== 'image') throw new BadRequestError(CODE_MESSAGES.JUST_IMAGE_FIELD_IS_ALLOWED);

    const path_validator = new Validator(add_image_path_schema);
    const { product_id } = await path_validator.validate(decodeObject(req.params));

    const add_image_business = new AddImage({
      logger,
      aws_params: aws_config(),
      bucket: CONFIGURATION.BUCKET_NAME
    });

    const image_id = await add_image_business.addImage(product_id, data);

    res.status(StatusCodes.CREATED);
    return { image_id };
  } catch (error) {
    const response = error_handler(logger, error, 'addImage');
    res.status(response.status);
    return response;
  }
}
