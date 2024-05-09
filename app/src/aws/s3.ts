import { DeleteObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Logger } from '../adapters/logger';
import { CONFIGURATION } from '../constants/configuration';

export class S3 {
  private client: S3Client;

  constructor(
    config: S3ClientConfig,
    private logger: Logger
  ) {
    this.client = new S3Client(config);
  }

  async upload(bucket: string, key: string, body: Buffer): Promise<void> {
    const command = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: `${CONFIGURATION.MICROSERVICE}/${key}`,
        Body: body
      }
    });

    command.on('httpUploadProgress', (progress) => this.logger.debug(progress));

    await command.done();
  }

  async remove(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: `${CONFIGURATION.MICROSERVICE}/${key}`
    });
    const response = await this.client.send(command);
    this.logger.debug(response);
  }
}
