import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class FileService {
  private s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const bucket = this.configService.get<string>('s3.bucket');
    if (!bucket) throw new Error('S3 bucket name is not defined');

    this.bucketName = bucket;
    this.s3 = new S3Client({
      region: this.configService.get<string>('s3.region'),
      endpoint: this.configService.get<string>('s3.endpoint') || undefined,
      forcePathStyle:
        this.configService.get<boolean>('s3.forcePathStyle') ?? true,
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey')!,
      },
    });
  }

  /** Upload 1 file, tạo thumbnail, trả về key */
  async uploadPhoto(
    file: Express.Multer.File,
  ): Promise<{ filePath: string; thumbnail: string }> {
    if (!file?.mimetype?.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const fileId = uuidv4();
    const ext = (file.originalname?.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
    const fileName = `${fileId}.${safeExt}`;
    const originalKey = `photos/${fileName}`;
    const thumbKey = `thumbnails/thumb_${fileName}`;

    try {
      // Upload original
      const originalUpload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: originalKey,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
          CacheControl: 'max-age=31536000,immutable',
        },
      });
      await originalUpload.done();

      // Generate thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbUpload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: thumbKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=31536000,immutable',
        },
      });
      await thumbUpload.done();

      return { filePath: originalKey, thumbnail: thumbKey };
    } catch (err) {
      console.error('Error uploading to S3:', err);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /** Xóa file gốc + thumbnail */
  async deletePhoto(filePath: string, thumbnail: string): Promise<void> {
    if (!filePath && !thumbnail) return;

    try {
      const objects: { Key: string }[] = [];
      if (filePath) objects.push({ Key: filePath });
      if (thumbnail) objects.push({ Key: thumbnail });

      if (objects.length === 0) return;

      await this.s3.send(
        new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: { Objects: objects },
        }),
      );
    } catch (err) {
      console.error('Failed to delete from S3:', err);
    }
  }
}
