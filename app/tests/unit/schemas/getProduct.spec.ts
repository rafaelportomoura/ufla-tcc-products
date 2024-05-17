import { expect } from 'chai';
import { get_product_path_schema, get_product_query_schema } from '../../../src/schemas/getProduct';

describe('Schema -> GetProduct', () => {
  describe('Path', () => {
    it('should return a valid schema for a valid path', () => {
      const path = {
        product_id: '123456789012345678901234'
      };

      const result = get_product_path_schema.parse(path);

      expect(result).deep.equal(path);
    });
    it('should throw an error for a path without product_id', () => {
      const path = {};

      const result = get_product_path_schema.safeParse(path);

      expect(result.success).equal(false);
    });
  });
  describe('Query', () => {
    it('should return a valid schema for a valid query', () => {
      const query = {
        project: { name: 1, description: 1, price: 1 }
      };

      const result = get_product_query_schema.parse(query);

      expect(result).deep.equal(query);
    });
    it('should return a valid schema for a query without project', () => {
      const query = {};

      const result = get_product_query_schema.parse(query);

      expect(result).deep.equal({});
    });
  });
});
