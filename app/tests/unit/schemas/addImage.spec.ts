import { expect } from 'chai';
import { Validator } from '../../../src/adapters/validate';
import { ValidationError } from '../../../src/exceptions/ValidationError';
import { add_image_path_schema } from '../../../src/schemas/addImage';
import { ProductData } from '../../data/product';

describe('Schema -> AddImage', async () => {
  it('Should validate schema', async () => {
    const validator = new Validator(add_image_path_schema);
    const product_id = ProductData._id();
    const result = await validator.validate({ product_id });
    expect(result).deep.eq({ product_id });
  });
  it('Should not validate schema', async () => {
    const validator = new Validator(add_image_path_schema);
    const result = await validator.validate({ product_id: 1 }).catch((e) => e);
    expect(result).instanceOf(ValidationError);
    expect(result.issues).deep.eq({ product_id: ['Expected string, received number'] });
  });
});
