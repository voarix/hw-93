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
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { CreateArtistDto } from './create.artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { artistImage } from '../middleware/multer';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.artistModel.find({ _id: id });
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage: artistImage }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createArtistDto: CreateArtistDto,
  ) {
    const artist = new this.artistModel({
      name: createArtistDto.name,
      info: createArtistDto.info,
      image: file ? '/uploads/artists/' + file.filename : null,
    });
    return artist.save();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.artistModel.findByIdAndDelete(id);
    return { message: 'Artist was deleted successfully' };
  }
}
