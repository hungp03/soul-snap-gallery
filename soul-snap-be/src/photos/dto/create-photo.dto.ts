import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreatePhotoDto {
  @IsNumber()
  @IsNotEmpty()
  albumId: number;

  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsOptional()
  @IsString()
  title?: string;
}