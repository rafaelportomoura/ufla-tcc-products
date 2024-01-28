import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';
import { create_product_model } from '../entities/product';
import { ProductSeed } from '../types/CreateProduct';
import { Env } from '../types/Env';
import { Product } from '../types/Product';

export class ProductsRepository {
  private model: Model<Product>;

  constructor({ stage, tenant }: Env) {
    this.model = create_product_model(stage, tenant);
  }

  async create(payload: ProductSeed): Promise<Product> {
    const product = await this.model.create(payload);
    return product.toObject();
  }

  async findOne(
    query: FilterQuery<Product>,
    projection: ProjectionType<Product> = {},
    options: QueryOptions<Product> = {}
  ): Promise<Product | undefined> {
    const product = await this.model.findOne(query, projection, options);

    return product?.toObject();
  }

  // filter(query: unknown): FilterQuery<Product>;
  // project(query: unknown): ProjectionType<Product>;
  // options(): QueryOptions<Product>
}
