import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('s3.accessKeyId'),
      secretAccessKey: this.configService.get<string>('s3.secretAccessKey'),
      region: this.configService.get<string>('s3.region'),
      endpoint: this.configService.get<string>('s3.endpoint'),
      s3ForcePathStyle: true, // for S3-compatible services
    });
    const bucketName = this.configService.get<string>('s3.bucket');
    if (!bucketName) {
      throw new Error('S3 bucket name is not defined');
    }
    this.bucketName = bucketName;
  }

  async uploadPhoto(file: Express.Multer.File): Promise<{
    filePath: string;
    thumbnail: string;
  }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const thumbnailName = `thumb_${fileName}`;

    try {
      // Upload original image
      const uploadParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `photos/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await this.s3.upload(uploadParams).promise();
      const filePath = `photos/${fileName}`;

      // Create and upload thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailParams: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `thumbnails/${thumbnailName}`,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };

      await this.s3.upload(thumbnailParams).promise();
      const thumbnail = `thumbnails/${thumbnailName}`;

      return { filePath, thumbnail };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  async deletePhoto(filePath: string, thumbnail: string): Promise<void> {
    try {
      const deleteParams: AWS.S3.DeleteObjectsRequest = {
        Bucket: this.bucketName,
        Delete: {
          Objects: [
            { Key: filePath },
            { Key: thumbnail },
          ],
        },
      };

      await this.s3.deleteObjects(deleteParams).promise();
    } catch (error) {
      console.error('Failed to delete files from S3:', error);
    }
  }
}