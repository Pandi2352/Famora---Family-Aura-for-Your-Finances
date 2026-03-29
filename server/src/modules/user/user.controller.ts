import {
  Controller,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { avatarStorage, avatarFileFilter, AVATAR_MAX_SIZE } from '../../config/multer.config';

interface AuthRequest {
  user: { id: string; email: string; name: string };
}

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile (name, phone)' })
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateProfile(req.user.id, dto);
    if (!user) throw new BadRequestException('User not found');

    return {
      message: 'Profile updated',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: (user as any).phone || null,
        avatar: user.avatar,
      },
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload or replace avatar image (JPG, PNG, WEBP — max 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter: avatarFileFilter,
      limits: { fileSize: AVATAR_MAX_SIZE },
    }),
  )
  async uploadAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Allowed: JPG, PNG, WEBP (max 2MB)');
    }

    // Store relative path: uploads/avatars/filename.ext
    const avatarPath = `uploads/avatars/${file.filename}`;
    const user = await this.userService.updateAvatar(req.user.id, avatarPath);

    return {
      message: 'Avatar uploaded',
      data: {
        avatar: user?.avatar || avatarPath,
      },
    };
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove avatar image' })
  async removeAvatar(@Req() req: AuthRequest) {
    await this.userService.removeAvatar(req.user.id);
    return {
      message: 'Avatar removed',
      data: { avatar: null },
    };
  }
}
