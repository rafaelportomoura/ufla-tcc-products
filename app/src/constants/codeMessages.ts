import { CONFIGURATION } from './configuration';

const prefix = (code: number) => `${CONFIGURATION.MICROSERVICE}-${String(code).padStart(4, '0')}`;

let n = 0;

export const CODE_MESSAGES = {
  INTERNAL_SERVER_ERROR: {
    code: prefix(n++),
    message: 'Internal Server Error!'
  },
  CANNOT_ACCESS_DATABASE: {
    code: prefix(n++),
    message: 'Cannot access database!'
  },
  VALIDATION_ERROR: {
    code: prefix(n++),
    message: 'Validation Error!'
  },
  PRODUCT_NOT_FOUND: {
    code: prefix(n++),
    message: 'Product not found!'
  },
  ALREADY_EXISTS_NAME: {
    code: prefix(n++),
    message: 'Already exists product with this name!'
  },
  CREATE_PRODUCT: {
    code: prefix(n++),
    message: 'Successfully created product!'
  },
  INVALID_PAGE: {
    code: prefix(n++),
    message: 'Invalid page!'
  }
} as const;
