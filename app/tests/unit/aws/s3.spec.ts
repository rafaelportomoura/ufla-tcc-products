/* eslint-disable dot-notation */
import { expect } from 'chai';
import Sinon from 'sinon';
import { Logger } from '../../../src/adapters/logger';
import { S3 } from '../../../src/aws/s3';
import { LoggerLevel } from '../../../src/constants/loggerLevel';

describe('AWS -> S3', () => {
  beforeEach(Sinon.restore);
  it('Should upload image', async () => {
    const s3 = new S3({}, new Logger(LoggerLevel.silent, ''));
    Sinon.stub(s3['client'], 'send').resolves({});
    const response = await s3.upload('b', 'k', Buffer.from('secret_path'));
    expect(response).deep.eq(undefined);
  });
  it('Should remove object', async () => {
    const s3 = new S3({}, new Logger(LoggerLevel.silent, ''));
    Sinon.stub(s3['client'], 'send').resolves({});
    const response = await s3.remove('b', 'k');
    expect(response).deep.eq(undefined);
  });
});
