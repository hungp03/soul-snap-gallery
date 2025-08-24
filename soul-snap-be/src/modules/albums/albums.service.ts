import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { createPaginationResult } from '../../common/utils/pagination.util';
import { PaginationResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
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
  ): Promise<PaginationResult<Album>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [albums, total] = await this.albumsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['photos'],
    });

    return createPaginationResult(albums, total, page, limit);
  }

  async findOne(userId: number, albumId: number): Promise<Album> {
    const album = await this.albumsRepository.findOne({
      where: { albumId, userId },
      relations: ['photos'],
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