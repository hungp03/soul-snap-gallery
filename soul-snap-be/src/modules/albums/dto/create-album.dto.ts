import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}