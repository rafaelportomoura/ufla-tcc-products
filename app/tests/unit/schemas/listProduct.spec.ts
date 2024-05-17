import { expect } from 'chai';
import { list_products_schema } from '../../../src/schemas/listProducts';

describe('Schema -> ListProductSchema', () => {
  it('should return a valid schema for a valid query', () => {
    const query = {
      page: 1,
      size: 10,
      project: { name: 1, price: 1 }
    };

    const result = list_products_schema.parse(query);

    expect(result).deep.equal({ ...query, sort: 'desc', sort_by: 'created_at' });
  });
  it('should return a valid schema for a query without project', () => {
    const query = {
      page: 1,
      size: 10
    };

    const result = list_products_schema.parse(query);

    expect(result).deep.equal({ ...query, sort: 'desc', sort_by: 'created_at' });
  });
  it('should return a valid schema for a query without page', () => {
    const query = {
      size: 10
    };

    const result = list_products_schema.safeParse(query);

    expect(result.data).deep.equal({ ...query, page: 1, sort: 'desc', sort_by: 'created_at' });
  });
  it('should return a valid schema for a query without size', () => {
    const query = {
      page: 1
    };

    const result = list_products_schema.safeParse(query);

    expect(result.data).deep.equal({ ...query, size: 10, sort: 'desc', sort_by: 'created_at' });
  });
});
