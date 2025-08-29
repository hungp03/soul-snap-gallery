import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumsService } from 'albums/albums.service';
import { AlbumsController } from 'albums/albums.controller';
import { Album } from 'albums/entities/album.entity';
import { CommonModule } from '@common/common.module';
import { Photo } from '@photos/entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Album, Photo]), CommonModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule { }