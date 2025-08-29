import { Injectable, BadRequestException } from '@nestjs/common';
import { AlbumsService } from '@albums/albums.service';
import { PhotosService } from 'photos/photos.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { User } from '@users/entities/user.entity';
import { FileService } from '@common/services/file.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(
    private readonly fileService: FileService,
    private readonly albumsService: AlbumsService,
    private readonly photosService: PhotosService,
  ) {}

  async uploadPhotos(
    files: Express.Multer.File[],
    uploadDto: UploadPhotoDto,
    user: User,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // check size
    const oversizeFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizeFiles.length > 0) {
      const oversizeNames = oversizeFiles.map((f) => f.originalname).join(', ');
      throw new BadRequestException(
        `Files exceed 10MB limit: ${oversizeNames}. All files rejected.`,
      );
    }

    // verify album
    const album = await this.albumsService.findOne(
      user.userId,
      uploadDto.albumId,
    );
    if (!album) {
      throw new BadRequestException(
        'Album not found or you do not have permission to access it',
      );
    }

    const results: any[] = [];
    const uploadedFiles: { filePath: string; thumbnail?: string }[] = [];

    try {
      for (const file of files) {
        if (file.size === 0) {
          throw new BadRequestException(`File ${file.originalname} is empty`);
        }

        // upload to S3
        const { filePath, thumbnail } = await this.fileService.uploadPhoto(file);
        uploadedFiles.push({ filePath, thumbnail });

        // save DB
        const photo = await this.photosService.create({
          albumId: uploadDto.albumId,
          filePath,
          thumbnail,
          title: uploadDto.title || file.originalname,
        });

        results.push(photo);
      }

      return {
        message: `Successfully uploaded ${results.length} photos`,
        photos: results,
      };
    } catch (error) {
      // rollback
      for (const uf of uploadedFiles) {
        try {
          await this.fileService.deletePhoto(uf.filePath, uf.thumbnail || '');
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      throw error;
    }
  }
}
