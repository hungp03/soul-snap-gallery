import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PhotoFilterDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  albumId?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDeleted?: boolean = false;
}