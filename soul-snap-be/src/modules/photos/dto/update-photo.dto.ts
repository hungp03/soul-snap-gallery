import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreatePhotoDto } from '@photos/dto/create-photo.dto';

export class UpdatePhotoDto extends PartialType(CreatePhotoDto) {
    @IsOptional()
    @IsBoolean()
    isFavorite?: boolean;
}