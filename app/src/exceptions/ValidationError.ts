import { CODE_MESSAGES } from '../constants/codeMessages';
import { BadRequestError } from './BadRequestError';

export class ValidationError extends BadRequestError {
  constructor(public issues: unknown) {
    super(CODE_MESSAGES.VALIDATION_ERROR);
    this.name = 'ValidationError';
  }

  toJSON() {
    const { issues } = this;
    return { ...super.toJSON(), issues };
  }
}
