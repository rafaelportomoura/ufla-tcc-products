import { expect } from 'chai';
import { create_product_schema } from '../../../src/schemas/createProduct';

describe('Schema -> CreateProduct', () => {
  it('should return a valid schema for a valid product', () => {
    const product = {
      name: 'Product Name',
      description: 'Product Description',
      price: 100.0
    };

    const result = create_product_schema.parse(product);

    expect(result).deep.equal(product);
  });
  it('should return a valid schema for a product without description', () => {
    const product = {
      name: 'Product Name',
      price: 100.0
    };

    const result = create_product_schema.parse(product);

    expect(result).deep.equal({ ...product, description: '' });
  });
  it('should throw an error for a product without name', () => {
    const product = {
      description: 'Product Description',
      price: 100.0
    };

    const result = create_product_schema.safeParse(product);

    expect(result.success).equal(false);
  });
  it('should throw an error for a product without price', () => {
    const product = {
      name: 'Product Name',
      description: 'Product Description'
    };

    const result = create_product_schema.safeParse(product);

    expect(result.success).equal(false);
  });
  it('should throw an error for a product with invalid price', () => {
    const product = {
      name: 'Product Name',
      description: 'Product Description',
      price: -100.0
    };

    const result = create_product_schema.safeParse(product);

    expect(result.success).equal(false);
  });
});
