import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from 'albums/entities/album.entity';
import { S3Service } from '@common/services/s3.service';
import { CreateAlbumDto } from 'albums/dto/create-album.dto';
import { UpdateAlbumDto } from 'albums/dto/update-album.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { createPaginationResult } from '@common/utils/pagination.util';
import { PaginationResult } from '@common/interfaces/pagination.interface';
@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
    private s3Service: S3Service,
  ) {}

  async create(userId: number, createAlbumDto: CreateAlbumDto): Promise<Album> {
    const album = this.albumsRepository.create({
      ...createAlbumDto,
      userId,
    });
    return this.albumsRepository.save(album);
  }

  async findAll(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginationResult<any>> {
    const page = Number(paginationDto.page ?? 1);
    const limit = Number(paginationDto.limit ?? 10);
    const offset = (page - 1) * limit;

    const raw = await this.albumsRepository.query(
      'CALL get_user_albums(?, ?, ?)',
      [userId, limit, offset]
    );

    const pickSet = (i: number): any[] => {
      if (!Array.isArray(raw)) return [];
      const set = raw[i];

      if (Array.isArray(set) && Array.isArray(set[0])) {
        return set[0];
      }
      if (Array.isArray(set)) {
        return set;
      }

      return [];
    };

    const rows = pickSet(0);
    const totalRow = pickSet(1)?.[0];
    const total = Number(totalRow?.total ?? 0);

    const transformed = await Promise.all(
      rows.map(async (album: any) => {
        const thumbnail =
          album.thumbnail_photo_id && album.thumbnail_url
            ? await this.s3Service.trySign(album.thumbnail_url)
            : null;
      
        return {
          albumId: album.album_id,
          userId: album.user_id,
          name: album.name,
          description: album.description,
          createdAt: album.created_at,
          updatedAt: album.updated_at,
          photoCount: Number(album.photo_count ?? 0),
          thumbnailPhoto: thumbnail
            ? {
              photoId: album.thumbnail_photo_id,
              thumbnail,
            }
            : null,
        };
      })
    );

    return createPaginationResult(transformed, total, page, limit);
  }



  async findOne(userId: number, albumId: number): Promise<Album> {
    const album = await this.albumsRepository.findOne({
      where: { albumId, userId }
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  async update(
    userId: number,
    albumId: number,
    updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    const album = await this.findOne(userId, albumId);
    Object.assign(album, updateAlbumDto);
    return this.albumsRepository.save(album);
  }

  async remove(userId: number, albumId: number): Promise<void> {
    const album = await this.findOne(userId, albumId);
    await this.albumsRepository.remove(album);
  }
}