import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from 'photos/entities/photo.entity';
import { CreatePhotoDto } from 'photos/dto/create-photo.dto';
import { UpdatePhotoDto } from 'photos/dto/update-photo.dto';
import { PhotoFilterDto } from 'photos/dto/photo-filter.dto';
import { createPaginationResult } from '@common/utils/pagination.util';
import { PaginationResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
  ) { }

  async create(createPhotoDto: CreatePhotoDto): Promise<Photo> {
    const photo = this.photosRepository.create(createPhotoDto);
    return this.photosRepository.save(photo);
  }

  async findAll(
    userId: number,
    filterDto: PhotoFilterDto,
  ): Promise<PaginationResult<Photo>> {
    const { page = 1, limit = 10, albumId, isFavorite, isDeleted } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.photosRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.album', 'album')
      .where('album.userId = :userId', { userId });

    if (albumId !== undefined) {
      queryBuilder.andWhere('photo.albumId = :albumId', { albumId });
    }

    if (isFavorite !== undefined) {
      queryBuilder.andWhere('photo.isFavorite = :isFavorite', { isFavorite });
    }

    if (isDeleted !== undefined) {
      queryBuilder.andWhere('photo.isDeleted = :isDeleted', { isDeleted });
    }

    queryBuilder
      .orderBy('photo.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [photos, total] = await queryBuilder.getManyAndCount();

    return createPaginationResult(photos, total, page, limit);
  }

  async findOne(userId: number, photoId: number): Promise<Photo> {
    const photo = await this.photosRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.album', 'album')
      .where('photo.photoId = :photoId', { photoId })
      .andWhere('album.userId = :userId', { userId })
      .getOne();

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  async update(
    userId: number,
    photoId: number,
    updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    const photo = await this.findOne(userId, photoId);
    Object.assign(photo, updatePhotoDto);
    return this.photosRepository.save(photo);
  }

  async toggleFavorite(userId: number, photoId: number): Promise<Photo> {
    const photo = await this.findOne(userId, photoId);
    photo.isFavorite = !photo.isFavorite;
    return this.photosRepository.save(photo);
  }

  async softDelete(userId: number, photoId: number): Promise<Photo> {
    const photo = await this.findOne(userId, photoId);
    photo.isDeleted = true;
    return this.photosRepository.save(photo);
  }

  async hardDelete(userId: number, photoId: number): Promise<void> {
    const photo = await this.findOne(userId, photoId);
    await this.photosRepository.remove(photo);
  }

  async restore(userId: number, photoId: number): Promise<Photo> {
    const photo = await this.findOne(userId, photoId);
    photo.isDeleted = false;
    return this.photosRepository.save(photo);
  }
}