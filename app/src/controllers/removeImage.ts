import '@fastify/multipart';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { aws_params } from '../aws/config';
import { RemoveImage } from '../business/removeImage';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { remove_image_path_schema } from '../schemas/removeImage';
import { decodeObject } from '../utils/uriDecodeComponent';

export async function removeImage(req: FastifyRequest, res: FastifyReply): Promise<void> {
  const path_validator = new Validator(remove_image_path_schema);
  const { product_id, image_id } = await path_validator.validate(decodeObject(req.params));
  const remove_image_business = new RemoveImage({
    logger: req.log,
    aws_params: aws_params(),
    bucket: CONFIGURATION.BUCKET_NAME
  });
  await remove_image_business.remove(product_id, image_id as string);
  res.status(HTTP_STATUS_CODE.NO_CONTENT);
  res.send();
}
