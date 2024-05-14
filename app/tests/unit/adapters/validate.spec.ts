import { expect } from 'chai';
import { Validator } from '../../../src/adapters/validate';
import { ValidationError } from '../../../src/exceptions/ValidationError';
import { add_image_path_schema } from '../../../src/schemas/addImage';

describe('Adapters -> Validate', async () => {
  it('Should validate forgot_password schema', async () => {
    const validator = new Validator(add_image_path_schema);
    const result = await validator.validate({ product_id: 'test' });
    expect(result).deep.eq({ product_id: 'test' });
  });
  it('Should not validate forgot_password schema', async () => {
    const validator = new Validator(add_image_path_schema);
    const result = await validator.validate({ product_id: 1 }).catch((e) => e);
    expect(result).instanceOf(ValidationError);
    expect(result.issues).deep.eq({ product_id: ['Expected string, received number'] });
  });
});
