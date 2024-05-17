/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayRequestAuthorizerEvent, Callback, Context } from 'aws-lambda';
import { expect } from 'chai';
import sinon from 'sinon';
import { CODE_MESSAGES } from '../../../src/constants/codeMessages';
import { ForbiddenError } from '../../../src/exceptions/ForbiddenError';
import { UnauthorizedError } from '../../../src/exceptions/Unauthorized';
import { authorizer } from '../../../src/handlers/authorizer';
import { OAuthService } from '../../../src/services/OAuth';
import { AuthorizerData } from '../../data/authorizer';

describe('Handlers -> Authorizer', () => {
  let event: APIGatewayRequestAuthorizerEvent;
  let context: Context;
  const callback: Callback = (arg: unknown) => {
    throw new UnauthorizedError(CODE_MESSAGES.UNAUTHORIZED);
  };
  let oauth_service_stub: sinon.SinonStub;
  const token = 'valid_token';
  const decoded_token = AuthorizerData.decodedToken();
  const method_arn = AuthorizerData.create();

  beforeEach(() => {
    event = {
      headers: { authorization: `Bearer ${token}` },
      methodArn: method_arn
    } as unknown as APIGatewayRequestAuthorizerEvent;
    context = {} as Context;

    oauth_service_stub = sinon.stub(OAuthService.prototype, 'validateToken');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a successful authorization response for a valid token and admin group', async () => {
    const policy = AuthorizerData.allowPolicyDocument(decoded_token.username, decoded_token.sub, `${method_arn}*`);
    oauth_service_stub.resolves({ decoded_token, group: 'admin' });

    const result = await authorizer(event, context, callback).catch((e) => e);

    expect(result).deep.equal(policy);
  });

  it('should return a successful authorization response when is TokenRequest for a valid token and admin group', async () => {
    const policy = AuthorizerData.allowPolicyDocument(decoded_token.username, decoded_token.sub, `${method_arn}*`);
    oauth_service_stub.resolves({ decoded_token, group: 'admin' });

    const result = await authorizer(
      { authorizationToken: token, methodArn: method_arn } as unknown as APIGatewayRequestAuthorizerEvent,
      context,
      callback
    ).catch((e) => e);

    expect(result).deep.equal(policy);
  });

  it('should return an success response for a valid token and non-admin group', async () => {
    const policy = AuthorizerData.denyPolicyDocument(decoded_token.sub, `${method_arn}*`);
    oauth_service_stub.resolves({ decoded_token, group: 'customer' });

    const result = await authorizer(event, context, callback).catch((e) => e);

    expect(result).deep.equal(policy);
  });

  it('should return an error response for non-valid token and non-admin group', async () => {
    const policy = AuthorizerData.denyPolicyDocument(decoded_token.sub, `${method_arn}*`);
    oauth_service_stub.rejects(new ForbiddenError(decoded_token));

    const result = await authorizer(event, context, callback).catch((e) => e);

    expect(result).deep.equal(policy);
  });

  it('should call callback with UnauthorizedError for an invalid token', async () => {
    const error = new UnauthorizedError(CODE_MESSAGES.UNAUTHORIZED);
    oauth_service_stub.rejects(error);

    const result = await authorizer(event, context, callback).catch((e) => e);

    expect(result).deep.equal(error);
  });
});
