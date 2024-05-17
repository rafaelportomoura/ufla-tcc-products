import { expect } from 'chai';
import { edit_product_schema } from '../../../src/schemas/editProduct';

describe('Schema -> EditProduct', () => {
  it('should return a valid schema for a valid edit product', () => {
    const product = {
      name: 'Product Name',
      description: 'Product Description',
      price: 100.0
    };

    const result = edit_product_schema.parse(product);

    expect(result).deep.equal(product);
  });
  it('should return a valid schema for a edit product without description', () => {
    const product = {
      name: 'Product Name',
      price: 100.0
    };

    const result = edit_product_schema.parse(product);

    expect(result).deep.equal(product);
  });
  it('should return a valid schema for a edit product without name', () => {
    const product = {
      description: 'Product Description',
      price: 100.0
    };

    const result = edit_product_schema.parse(product);

    expect(result).deep.equal(product);
  });
  it('should return a valid schema for a edit product without price', () => {
    const product = {
      name: 'Product Name',
      description: 'Product Description'
    };

    const result = edit_product_schema.parse(product);

    expect(result).deep.equal(product);
  });
  it('should throw an error for a empty edit product', () => {
    const product = {};

    const result = edit_product_schema.safeParse(product);

    expect(result.success).equal(false);
  });
});
