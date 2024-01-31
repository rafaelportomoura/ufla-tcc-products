import { FastifyReply, FastifyRequest } from 'fastify';
import { Validator } from '../adapters/validate';
import { EditProduct } from '../business/editProduct';
import { CONFIGURATION } from '../constants/configuration';
import { HTTP_STATUS_CODE } from '../constants/httpStatus';
import { edit_product_schema } from '../schemas/editProduct';
import { EditProductPayload } from '../types/EditProduct';

export async function editProduct(req: FastifyRequest, res: FastifyReply): Promise<void> {
  const logger = req.log;
  const product_id = decodeURIComponent((req.params as Record<string, string>).product_id);
  const validator = new Validator(edit_product_schema);
  const body = await validator.validate(req.body);
  const business = new EditProduct(product_id, {
    logger,
    topic: CONFIGURATION.EVENT_BUS,
    region: CONFIGURATION.REGION
  });
  await business.edit(body as EditProductPayload);
  res.status(HTTP_STATUS_CODE.NO_CONTENT).send();
}
