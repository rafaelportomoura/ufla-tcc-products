import { expect } from 'chai';
import { product_schema, project_product_schema } from '../../../src/schemas/product';
import { ProductData } from '../../data/product';

describe('Schema -> Product', () => {
  it('should validate a valid product', () => {
    const valid_product = ProductData.product();

    expect(() => product_schema._id.parse(valid_product._id)).not.throw();
    expect(() => product_schema.name.parse(valid_product.name)).not.throw();
    expect(() => product_schema.description.parse(valid_product.description)).not.throw();
    expect(() => product_schema.price.parse(valid_product.price)).not.throw();
  });

  it('should throw an error for an invalid ObjectId', () => {
    const invalid_product_id = 'invalid_object_id';

    expect(() => product_schema._id.parse(invalid_product_id)).throw('Invalid ObjectId');
  });

  it('should throw an error for an invalid name', () => {
    const invalid_name = '';

    expect(() => product_schema.name.parse(invalid_name)).throw();
  });

  it('should throw an error for an invalid description', () => {
    const invalid_description = 'A'.repeat(251);

    expect(() => product_schema.description.parse(invalid_description)).throw();
  });

  it('should throw an error for an invalid price', () => {
    const invalid_price = -19.99;

    expect(() => product_schema.price.parse(invalid_price)).throw();
  });

  it('should throw an error for a price with more than two decimals', () => {
    const invalid_price = 19.999;

    expect(() => product_schema.price.parse(invalid_price)).throw();
  });
});

describe('Schema -> project_product_schema', () => {
  it('should validate a valid project product schema', () => {
    const valid_project = {
      _id: '1',
      name: '1',
      description: '1',
      price: '1',
      created_at: '1',
      updated_at: '1',
      images: '1',
      status: '1'
    };

    expect(() => project_product_schema.parse(valid_project)).not.throw();
  });

  it('should throw an error for a mixed inclusion and exclusion projection', () => {
    const invalid_project = {
      _id: '1',
      name: '0'
    };

    expect(() => project_product_schema.parse(invalid_project)).throw('Cannot do inclusion and exclusion projection');
  });
});
