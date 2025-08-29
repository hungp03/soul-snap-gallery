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
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UploadPhotoDto } from 'upload/dto/upload-photo.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';
import { UploadService } from './upload.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadPhotoDto,
    @CurrentUser() user: User,
  ) {
    return this.uploadService.uploadPhotos(files, uploadDto, user);
  }
}
