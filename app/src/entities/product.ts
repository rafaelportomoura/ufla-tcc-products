import { model, Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/collectionNames';
import { Product } from '../types/Product';

const details_schema = new Schema<Product['details']>({}, { strict: false, _id: false, versionKey: false });

const product_schema = new Schema<Product>(
  {
    name: { type: String, index: true },
    price: { type: Number, index: true },
    details: details_schema,
    images: [String],
    status: { type: String, index: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export const create_product_model = (stage: string, tenant: string) =>
  model<Product>('Product', product_schema, COLLECTION_NAMES.PRODUCTS(stage, tenant));
