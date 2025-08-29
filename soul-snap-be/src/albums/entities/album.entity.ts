import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'users/entities/user.entity';
import { Photo } from 'photos/entities/photo.entity';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn({ name: 'album_id' })
  albumId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.albums)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Photo, (photo) => photo.album)
  photos: Photo[];
}