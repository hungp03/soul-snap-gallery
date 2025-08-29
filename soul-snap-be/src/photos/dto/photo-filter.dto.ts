import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '@common/dto/pagination.dto';

export class PhotoFilterDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  albumId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDeleted?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFavorite?: boolean;
}