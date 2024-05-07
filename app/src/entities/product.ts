import { model, Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/collectionNames';
import { Product } from '../types/Product';

const product_schema = new Schema<Product>(
  {
    name: { type: String, index: true },
    price: { type: Number, index: true },
    description: { type: String },
    images: [String]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export const create_product_model = () => model<Product>('Product', product_schema, COLLECTION_NAMES.PRODUCTS);
