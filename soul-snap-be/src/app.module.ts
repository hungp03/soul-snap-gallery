import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AlbumsModule } from './modules/albums/albums.module';
import { PhotosModule } from './modules/photos/photos.module';
import { UploadModule } from './modules/upload/upload.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import s3Config from './config/s3.config';
import { User } from './modules/users/entities/user.entity';
import { Album } from './modules/albums/entities/album.entity';
import { Photo } from './modules/photos/entities/photo.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, s3Config],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [User, Album, Photo],
        synchronize: false, // Set to false in production
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AlbumsModule,
    PhotosModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}