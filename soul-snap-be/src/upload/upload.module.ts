import { Module } from '@nestjs/common';
import { UploadService } from 'upload/upload.service';
import { UploadController } from 'upload/upload.controller';
import { PhotosModule } from 'photos/photos.module';

@Module({
  imports: [PhotosModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule { }