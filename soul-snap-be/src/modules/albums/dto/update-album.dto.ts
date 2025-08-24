import { PartialType } from '@nestjs/mapped-types';
import { CreateAlbumDto } from '@albums/dto/create-album.dto';

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}