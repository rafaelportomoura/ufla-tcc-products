import { expect } from 'chai';
import { z } from 'zod';
import { OPERATOR } from '../../../src/constants/search';
import { project_schema, search_schema } from '../../../src/schemas/search';

describe('Schema -> ProjectSchema', () => {
  it('should validate inclusion projection correctly', () => {
    const schema = project_schema('name', 'price');
    const valid_data = { name: '1', price: '1' };

    expect(schema.parse(valid_data)).deep.equal({ name: 1, price: 1 });
  });

  it('should validate exclusion projection correctly', () => {
    const schema = project_schema('name', 'price');
    const valid_data = { name: '0', price: '0' };

    expect(schema.parse(valid_data)).deep.equal({ name: 0, price: 0 });
  });

  it('should throw error on mixed inclusion and exclusion projection', () => {
    const schema = project_schema('name', 'price');
    const invalid_data = { name: '1', price: '0' };

    expect(() => schema.parse(invalid_data)).throw('Cannot do inclusion and exclusion projection');
  });
});

describe('Schema -> SearchSchema', () => {
  const types = {
    name: z.string(),
    price: z.number()
  };

  const schema = search_schema(types);

  it('should validate search schema correctly with EQ operator', () => {
    const valid_data = {
      name: { [OPERATOR.EQ]: 'Test' },
      price: { [OPERATOR.EQ]: 100 }
    };

    expect(schema.parse(valid_data)).deep.equal(valid_data);
  });

  it('should validate search schema correctly with multiple operators', () => {
    const valid_data = {
      name: { [OPERATOR.REGEX]: 'Test' },
      price: { [OPERATOR.GT]: 50, [OPERATOR.LTE]: 200 }
    };

    expect(schema.parse(valid_data)).deep.equal(valid_data);
  });

  it('should throw error when using conflicting EQ and NE operators', () => {
    const invalid_data = {
      name: { [OPERATOR.EQ]: 'Test', [OPERATOR.NE]: 'Test2' }
    };

    expect(() => schema.parse(invalid_data)).throw('Cannot use EQ and NE with the same property!');
  });

  it('should throw error when using conflicting IN and NIN operators', () => {
    const invalid_data = {
      price: { [OPERATOR.IN]: [100, 200], [OPERATOR.NIN]: [300, 400] }
    };

    expect(() => schema.parse(invalid_data)).throw('Cannot use IN and NIN with the same property!');
  });
});
