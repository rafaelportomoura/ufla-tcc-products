import { FastifyBaseLogger } from 'fastify';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';
import { STATUS_MAP } from '../constants/status';
import { DocumentDatabase } from '../database/document';
import { create_product_model } from '../entities/product';
import { AwsParams } from '../types/Aws';
import { RawProduct } from '../types/CreateProduct';
import { EditProductPayload } from '../types/EditProduct';
import { Product } from '../types/Product';

export class ProductsRepository {
  private model: Model<Product>;

  private document_database: DocumentDatabase;

  constructor(aws: AwsParams, logger: FastifyBaseLogger) {
    this.model = create_product_model();
    this.document_database = new DocumentDatabase(aws, logger);
  }

  async connect() {
    await this.document_database.connect();
  }

  async disconnect() {
    await this.document_database.disconnect();
  }

  async create(payload: RawProduct): Promise<Product> {
    const product = await this.model.create(payload);
    return product.toObject();
  }

  async edit(product_id: Product['_id'], edit: EditProductPayload): Promise<Product | null> {
    const response = await this.model.findOneAndUpdate(
      {
        _id: product_id,
        ...this.visibleStatusFilter()
      },
      edit,
      { lean: true }
    );
    return response;
  }

  async findOne(
    query: FilterQuery<Product>,
    projection: ProjectionType<Product> = {},
    options: QueryOptions<Product> = {}
  ): Promise<Product | undefined> {
    const product = await this.model.findOne(query, projection, options);

    return options.lean ? (product as Product) : product?.toObject();
  }

  alreadyExistFilter(name: Product['name']): FilterQuery<Product> {
    return {
      name,
      ...this.visibleStatusFilter()
    };
  }

  visibleStatusFilter(): FilterQuery<Product> {
    return {
      status: {
        $in: [STATUS_MAP.AVAILABLE, STATUS_MAP.UNAVAILABLE]
      }
    };
  }

  diffIdFilter(id: Product['_id']): FilterQuery<Product> {
    return {
      _id: { $ne: id }
    };
  }
}
