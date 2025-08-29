import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { FileService } from './services/file.service';

@Module({
  imports: [ConfigModule],
  providers: [FileService, S3Service],
  exports: [FileService, S3Service],
})
export class CommonModule {}
