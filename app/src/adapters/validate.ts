/* eslint-disable no-empty-function */
import { ZodType, z } from 'zod';
import { ValidationError } from '../exceptions/ValidationError';

export class Validator<T extends ZodType> {
  constructor(private schema: T) {}

  async validate(value_to_check: unknown): Promise<z.infer<T>> {
    const result = await this.schema.safeParseAsync(value_to_check);

    if (result.success) return result.data;

    throw new ValidationError(result.error.formErrors.fieldErrors);
  }
}
