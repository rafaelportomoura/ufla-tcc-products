import { StatusCodes } from 'http-status-codes';
import { CodeMessage } from '../types/CodeMessage';
import { BaseError } from './BaseError';

export class PayloadTooLargeError extends BaseError {
  constructor(code_message: CodeMessage) {
    super(code_message, StatusCodes.REQUEST_TOO_LONG);
    this.name = 'PayloadTooLarge';
  }
}
