import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create.album.dto';
import { albumImage } from '../middleware/multer';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import { UserDocument } from '../schemas/user.schema';
import { Request } from 'express';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  getAll(@Query('artistId') artistId?: string) {
    const findQuery: { artist?: string } = {};
    if (artistId) {
      findQuery.artist = artistId;
    }
    return this.albumModel.find(findQuery);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.albumModel.find({ _id: id });
  }

  @Post()
  @UseGuards(TokenAuthGuard)
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
  @UseGuards(TokenAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: Request<{ user: UserDocument }>,
  ) {
    const user = req.user as UserDocument;

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete albums.');
    }

    await this.albumModel.findByIdAndDelete(id);
    return { message: 'Album was deleted successfully' };
  }
}
