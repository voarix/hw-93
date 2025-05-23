import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create.album.dto';
import { albumImage } from '../middleware/multer';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  getAll() {
    return this.albumModel.find();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.albumModel.find({ _id: id });
  }

  @Get('artist/:artistId')
  getAlbumsByArtist(@Param('artistId') artistId: string) {
    return this.albumModel.find({ artist: artistId });
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: albumImage }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAlbumDto: CreateAlbumDto,
  ) {
    const album = new this.albumModel({
      artist: createAlbumDto.artist,
      name: createAlbumDto.name,
      date: createAlbumDto.date,
      image: file ? '/uploads/albums/' + file.filename : null,
    });
    return album.save();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.albumModel.findByIdAndDelete(id);
    return { message: 'Album was deleted successfully' };
  }
}
