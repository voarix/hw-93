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
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTrackDto } from './create.track.dto';
import { Track, TrackDocument } from '../schemas/track.schema';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';
import { UserDocument } from '../schemas/user.schema';
import { Request } from 'express';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  getAll(@Query('albumId') albumId?: string) {
    const findQuery: { album?: string } = {};
    if (albumId) {
      findQuery.album = albumId;
    }
    return this.trackModel.find(findQuery);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.trackModel.find({ _id: id });
  }

  @UseGuards(TokenAuthGuard)
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
  @UseGuards(TokenAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: Request<{ user: UserDocument }>,
  ) {
    const user = req.user as UserDocument;

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete tracks');
    }

    await this.trackModel.findByIdAndDelete(id);
    return { message: 'Track was deleted successfully' };
  }
}
