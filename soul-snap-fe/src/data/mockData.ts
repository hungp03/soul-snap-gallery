import { Photo, Album } from '@/types/gallery'

export const mockPhotos: Photo[] = [
  {
    id: '1',
    title: 'Mountain Sunset',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    dateAdded: '2024-01-15',
    size: '2.4 MB',
    isFavorite: true,
    isDeleted: false,
    albumId: '1'
  },
  {
    id: '2',
    title: 'City Lights',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=200&fit=crop',
    dateAdded: '2024-01-14',
    size: '3.1 MB',
    isFavorite: false,
    isDeleted: false,
    albumId: '2'
  },
  {
    id: '3',
    title: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200&fit=crop',
    dateAdded: '2024-01-13',
    size: '1.8 MB',
    isFavorite: true,
    isDeleted: false,
    albumId: '1'
  },
  {
    id: '4',
    title: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
    dateAdded: '2024-01-12',
    size: '2.7 MB',
    isFavorite: false,
    isDeleted: false,
    albumId: '3'
  },
  {
    id: '5',
    title: 'Deleted Photo',
    url: 'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1418489098061-ce87b5dc3aee?w=300&h=200&fit=crop',
    dateAdded: '2024-01-11',
    size: '1.9 MB',
    isFavorite: false,
    isDeleted: true
  },
  {
    id: '6',
    title: 'Desert Landscape',
    url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop',
    dateAdded: '2024-01-10',
    size: '2.2 MB',
    isFavorite: true,
    isDeleted: false,
    albumId: '2'
  }
]

export const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Nature',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    photoCount: 2,
    dateCreated: '2024-01-15',
    photos: mockPhotos.filter(p => p.albumId === '1')
  },
  {
    id: '2',
    name: 'Urban',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=200&fit=crop',
    photoCount: 2,
    dateCreated: '2024-01-14',
    photos: mockPhotos.filter(p => p.albumId === '2')
  },
  {
    id: '3',
    name: 'Adventure',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
    photoCount: 1,
    dateCreated: '2024-01-12',
    photos: mockPhotos.filter(p => p.albumId === '3')
  }
]