import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UploadPhotoDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  albumId: number;

  @IsOptional()
  @IsString()
  title?: string;
}