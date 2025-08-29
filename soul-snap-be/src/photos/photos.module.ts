import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosService } from 'photos/photos.service';
import { PhotosController } from 'photos/photos.controller';
import { Photo } from 'photos/entities/photo.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), CommonModule],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule { }