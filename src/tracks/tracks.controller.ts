import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTrackDto } from './create.track.dto';
import { Track, TrackDocument } from '../schemas/track.schema';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  getAll() {
    return this.trackModel.find();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.trackModel.find({ _id: id });
  }

  @Get('album/:albumId')
  getAlbumsByArtist(@Param('albumId') albumId: string) {
    return this.trackModel.find({ album: albumId });
  }

  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    const track = new this.trackModel({
      album: trackDto.album,
      name: trackDto.name,
      duration: trackDto.duration,
      youtubeLink: trackDto.youtubeLink,
    });

    return await track.save();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.trackModel.findByIdAndDelete(id);
    return { message: 'Track was deleted successfully' };
  }
}
