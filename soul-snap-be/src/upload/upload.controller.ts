import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'upload/upload.service';
import { PhotosService } from 'photos/photos.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UploadPhotoDto } from 'upload/dto/upload-photo.dto';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly photosService: PhotosService,
  ) { }

  @Post('photos')
  @UseInterceptors(FilesInterceptor('files', 10)) // field name: "files", max 10
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadPhotoDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results: any[] = [];
    for (const file of files) {
      const { filePath, thumbnail } = await this.uploadService.uploadPhoto(file);

      const photo = await this.photosService.create({
        albumId: uploadDto.albumId,
        filePath,
        thumbnail,
        title: uploadDto.title,
      });

      results.push(photo);
    }

    return results;
  }
}
