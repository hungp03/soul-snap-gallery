import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly defaultTtl: number;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('s3.bucket', '');
    if (!this.bucket) throw new Error('S3 bucket name is not defined');

    this.defaultTtl = Number(this.config.get('s3.signedTtl', 3600));

    const region = this.config.get<string>('s3.region', 'ap-southeast-1');
    const endpoint = this.config.get<string>('s3.endpoint') || undefined;
    const forcePathStyle = this.config.get<boolean>('s3.forcePathStyle', true);
    const accessKeyId = this.config.get<string>('s3.accessKeyId');
    const secretAccessKey = this.config.get<string>('s3.secretAccessKey');

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined,
    });
  }

  async signGetObject(
    key: string,
    ttl?: number,
    overrides?: {
      responseContentType?: string;
      responseContentDisposition?: string;
      responseCacheControl?: string;
    },
  ): Promise<string> {
    if (!key) throw new Error('key is required');

    const normalizedKey = key.replace(/^\/+/, '');
    const expiresIn = Math.min(Math.max(1, Math.floor(ttl ?? this.defaultTtl)), 604800);

    const params: GetObjectCommandInput = {
      Bucket: this.bucket,
      Key: normalizedKey,
      ...overrides,
    };

    const cmd = new GetObjectCommand(params);
    return getSignedUrl(this.s3, cmd, { expiresIn });
  }

  async trySign(key?: string | null, ttl?: number): Promise<string | null> {
    try {
      if (!key) return null;
      const signed = await this.signGetObject(key, ttl);
      return signed;
    } catch (e) {
      return null;
    }
  }
}
