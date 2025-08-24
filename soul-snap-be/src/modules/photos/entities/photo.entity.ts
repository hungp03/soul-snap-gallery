import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Album } from '@albums/entities/album.entity';

@Entity('photos')
export class Photo {
    @PrimaryGeneratedColumn({ name: 'photo_id' })
    photoId: number;

    @Column({ name: 'album_id' })
    albumId: number;

    @Column({ type: 'text' })
    thumbnail: string;

    @Column({ name: 'file_path', type: 'text' })
    filePath: string;

    @Column({ length: 150, nullable: true })
    title: string;

    @Column({ name: 'is_favorite', default: false })
    isFavorite: boolean;

    @Column({ name: 'is_deleted', default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Album, (album) => album.photos)
    @JoinColumn({ name: 'album_id' })
    album: Album;
}