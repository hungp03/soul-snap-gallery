import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UploadPhotoDto {
  @IsNumber()
  @Type(() => Number)
  albumId: number;

  @IsOptional()
  @IsString()
  title?: string;
}