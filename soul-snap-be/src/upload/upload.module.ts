import { Module } from '@nestjs/common';
import { UploadService } from 'upload/upload.service';
import { UploadController } from 'upload/upload.controller';
import { PhotosModule } from 'photos/photos.module';
import { AlbumsModule } from '@albums/albums.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [PhotosModule, AlbumsModule, CommonModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule { }