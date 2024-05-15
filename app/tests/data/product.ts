/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { CreateProductPayload } from '../../src/types/CreateProduct';
import { EditProductPayload } from '../../src/types/EditProduct';
import { Product } from '../../src/types/Product';

export class ProductData {
  static product(d?: Partial<Product>): Product {
    return {
      _id: faker.database.mongodbObjectId(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ multipleOf: 0.01 }),
      images: [faker.internet.url()],
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      ...d
    };
  }
  static create(d?: Partial<CreateProductPayload>): CreateProductPayload {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float({ multipleOf: 0.01 }),
      ...d
    };
  }

  static edit(d?: Partial<EditProductPayload>): EditProductPayload {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.number.float(),
      ...d
    };
  }
}
