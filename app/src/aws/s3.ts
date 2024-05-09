import { DeleteObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { Logger } from '../adapters/logger';

export class S3 {
  private client: S3Client;

  constructor(
    config: S3ClientConfig,
    private logger: Logger
  ) {
    this.client = new S3Client(config);
  }

  async upload(bucket: string, key: string, body: Buffer): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body
    });

    await this.client.send(command);
  }

  async remove(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    const response = await this.client.send(command);
    this.logger.debug(response);
  }
}
