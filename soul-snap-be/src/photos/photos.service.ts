import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from 'photos/entities/photo.entity';
import { Album } from 'albums/entities/album.entity';
import { CreatePhotoDto } from 'photos/dto/create-photo.dto';
import { UpdatePhotoDto } from 'photos/dto/update-photo.dto';
import { PhotoFilterDto } from 'photos/dto/photo-filter.dto';
import { createPaginationResult } from '@common/utils/pagination.util';
import { PaginationResult } from '@common/interfaces/pagination.interface';
import { S3Service } from '@common/services/s3.service';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { FileService } from '@common/services/file.service';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private fileService: FileService,
    private s3Service: S3Service,
  ) { }

  async create(createPhotoDto: CreatePhotoDto): Promise<Photo> {
    const photo = this.photosRepository.create(createPhotoDto);
    return this.photosRepository.save(photo);
  }

  async findAll(
    userId: number,
    filterDto: PhotoFilterDto,
  ): Promise<PaginationResult<PhotoResponseDto>> {
    const { page = 1, limit = 10, albumId, isFavorite, isDeleted } = filterDto;
    const skip = (page - 1) * limit;

    const qb = this.photosRepository.createQueryBuilder('photo');

    qb.andWhere((subQb) => {
      const sub = subQb
        .subQuery()
        .select('1')
        .from(Album, 'album')
        .where('album.albumId = photo.albumId')
        .andWhere('album.userId = :userId')
        .getQuery();
      return `EXISTS ${sub}`;
    }).setParameter('userId', userId);

    if (albumId !== undefined) qb.andWhere('photo.albumId = :albumId', { albumId });
    if (isFavorite !== undefined) qb.andWhere('photo.isFavorite = :isFavorite', { isFavorite });
    if (isDeleted !== undefined) qb.andWhere('photo.isDeleted = :isDeleted', { isDeleted });

    qb.orderBy('photo.createdAt', 'DESC').skip(skip).take(limit);

    const [photos, total] = await qb.getManyAndCount();

    const mapped = await Promise.all(photos.map((p) => this.toPhotoResponseDto(p)));
    return createPaginationResult(mapped, total, page, limit);
  }


  async findOne(userId: number, photoId: number): Promise<Photo> {
    const photo = await this.photosRepository
      .createQueryBuilder('photo')
      .where('photo.photoId = :photoId', { photoId })
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('1')
          .from(Album, 'album')
          .where('album.albumId = photo.albumId')
          .andWhere('album.userId = :userId')
          .getQuery();
        return `EXISTS ${sub}`;
      })
      .setParameter('userId', userId)
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

  async toggleFavorite(userId: number, photoId: number): Promise<PhotoResponseDto> {
    const photo = await this.findOne(userId, photoId);
    photo.isFavorite = !photo.isFavorite;
    const saved = await this.photosRepository.save(photo);
    return this.toPhotoResponseDto(saved);
  }

  async toggleSoftDelete(userId: number, photoId: number): Promise<PhotoResponseDto> {
    const photo = await this.findOne(userId, photoId);
    photo.isDeleted = !photo.isDeleted;
    const saved = await this.photosRepository.save(photo);
    return this.toPhotoResponseDto(saved);
  }
  
  async hardDelete(userId: number, photoId: number): Promise<void> {
    const photo = await this.findOne(userId, photoId);

    await this.photosRepository.manager.transaction(async (manager) => {
      await manager.remove(photo);
      try {
        await this.fileService.deletePhoto(photo.filePath, photo.thumbnail);
      } catch (err) {
        console.error('Failed to delete file from S3:', err);
      }
    });
  }



  private async toPhotoResponseDto(p: Photo): Promise<PhotoResponseDto> {
    return {
      photoId: p.photoId,
      albumId: p.albumId,
      title: p.title,
      isFavorite: p.isFavorite,
      isDeleted: p.isDeleted,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      thumbnailUrl: await this.s3Service.trySign(p.thumbnail),
      fileUrl: await this.s3Service.trySign(p.filePath),
    };
  }
}