import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PhotosService } from 'photos/photos.service';
import { CreatePhotoDto } from 'photos/dto/create-photo.dto';
import { UpdatePhotoDto } from 'photos/dto/update-photo.dto';
import { PhotoFilterDto } from 'photos/dto/photo-filter.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from 'users/entities/user.entity';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) { }

  @Post()
  create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() filterDto: PhotoFilterDto,
  ) {
    return this.photosService.findAll(user.userId, filterDto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.photosService.findOne(user.userId, +id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ) {
    return this.photosService.update(user.userId, +id, updatePhotoDto);
  }

  @Patch(':id/favorite')
  toggleFavorite(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.photosService.toggleFavorite(user.userId, +id);
  }

  @Delete(':id/soft')
  softDelete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.photosService.softDelete(user.userId, +id);
  }

  @Delete(':id/hard')
  hardDelete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.photosService.hardDelete(user.userId, +id);
  }

  @Patch(':id/restore')
  restore(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.photosService.restore(user.userId, +id);
  }
}