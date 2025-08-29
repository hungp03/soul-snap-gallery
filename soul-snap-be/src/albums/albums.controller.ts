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
import { AlbumsService } from 'albums/albums.service';
import { CreateAlbumDto } from 'albums/dto/create-album.dto';
import { UpdateAlbumDto } from 'albums/dto/update-album.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from 'users/entities/user.entity';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller('albums')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) { }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createAlbumDto: CreateAlbumDto,
  ) {
    return this.albumsService.create(user.userId, createAlbumDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.albumsService.findAll(user.userId, paginationDto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.albumsService.findOne(user.userId, +id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ) {
    return this.albumsService.update(user.userId, +id, updateAlbumDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.albumsService.remove(user.userId, +id);
  }
}