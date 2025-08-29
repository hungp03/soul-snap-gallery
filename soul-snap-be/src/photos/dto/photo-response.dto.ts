export class PhotoResponseDto {
  photoId: number;
  albumId: number;
  title?: string;
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl: string | null;
  fileUrl: string | null;
}
