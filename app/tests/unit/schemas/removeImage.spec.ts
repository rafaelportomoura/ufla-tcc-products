import { expect } from 'chai';
import { remove_image_path_schema } from '../../../src/schemas/removeImage';
import { ProductData } from '../../data/product';

describe('Schema -> remove_image_path_schema', () => {
  const product_id = ProductData._id();
  it('should validate a valid schema', () => {
    const valid_data = {
      product_id,
      image_id: 'images/12345'
    };

    const result = remove_image_path_schema.parse(valid_data);
    expect(result).to.deep.equal({
      product_id,
      image_id: '12345'
    });
  });

  it('should throw an error for an invalid product_id', () => {
    const invalid_data = {
      product_id: 'invalid_object_id',
      image_id: 'images/12345'
    };

    expect(() => remove_image_path_schema.parse(invalid_data)).to.throw('Invalid ObjectId');
  });

  it('should throw an error for an empty image_id', () => {
    const invalid_data = {
      product_id,
      image_id: 'images/'
    };
    const result = remove_image_path_schema.safeParse(invalid_data);

    expect(result.success).equal(false);
  });

  it('should throw an error for an image_id that is too long', () => {
    const invalid_data = {
      product_id,
      image_id: 'a'.repeat(265)
    };

    const result = remove_image_path_schema.safeParse(invalid_data);

    expect(result.success).equal(false);
  });

  it('should throw an error for an invalid format image_id', () => {
    const invalid_data = {
      product_id,
      image_id: ''
    };

    const result = remove_image_path_schema.safeParse(invalid_data);

    expect(result.success).equal(false);
  });
});
