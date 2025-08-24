import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1',
  bucket: process.env.S3_BUCKET,
  endpoint: process.env.S3_ENDPOINT,
}));