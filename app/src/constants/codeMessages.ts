import { CONFIGURATION } from './configuration';
import { ALLOWED_MIMETYPES } from './mimetype';

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
  },
  IMAGE_IS_REQUIRED: {
    code: prefix(n++),
    message: 'Image is required!'
  },
  IMAGE_IS_LARGER_THAN_FIVE_MEGABYTES: {
    code: prefix(n++),
    message: 'Image is larger than 5mb'
  },
  UNSUPPORTED_IMAGES_TYPE: {
    code: prefix(n++),
    message: `Unsupported mimetype! Allowed mimetypes are: ${ALLOWED_MIMETYPES.join(', ')}`
  },
  JUST_IMAGE_FIELD_IS_ALLOWED: {
    code: prefix(n++),
    message: 'Just image field is allowed!'
  },
  IMAGE_NOT_FOUND: {
    code: prefix(n++),
    message: 'Image not found!'
  }
} as const;
