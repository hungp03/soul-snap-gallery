import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumsService } from 'albums/albums.service';
import { AlbumsController } from 'albums/albums.controller';
import { Album } from 'albums/entities/album.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Album]), CommonModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule { }