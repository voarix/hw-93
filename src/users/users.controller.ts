import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenAuthGuard } from '../token-auth/token-auth.guard';

@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Post()
  register(@Body() registerUserDto: RegisterUserDto) {
    const user = new this.userModel({
      email: registerUserDto.email,
      displayName: registerUserDto.displayName,
      password: registerUserDto.password,
    });
    user.generateToken();
    return user.save();
  }

  @UseGuards(AuthGuard('local'))
  @Post('/sessions')
  login(@Req() req: Request<{ user: User }>) {
    return req.user;
  }

  @UseGuards(TokenAuthGuard)
  @Delete('/sessions')
  async logout(@Req() req: Request<{ user: UserDocument }>) {
    const user = req.user as UserDocument;

    user.generateToken();
    await user.save();

    return { message: 'Logged out successfully' };
  }

  @UseGuards(TokenAuthGuard)
  @Get('/secret')
  secret(@Req() req: Request<{ user: User }>) {
    return { user: req.user, message: 'Secret content' };
  }
}
