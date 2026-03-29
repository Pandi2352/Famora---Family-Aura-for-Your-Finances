import {
  Controller, Get, Post, Delete, Query, Param, Body,
  UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { generateUUID } from '../../utils/uuid';

interface AuthRequest {
  user: { id: string };
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(private docService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'documents'),
        filename: (_req, file, cb) => cb(null, `${generateUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('familyId') familyId: string,
    @Body('category') category: string,
    @Body('description') description: string,
    @Req() req: AuthRequest,
  ) {
    if (!file) throw new BadRequestException('No file. Allowed: PDF, JPG, PNG, WEBP (max 5MB)');
    if (!familyId) throw new BadRequestException('familyId is required');

    const data = await this.docService.upload({
      familyId,
      uploadedBy: req.user.id,
      fileName: file.originalname,
      fileUrl: `uploads/documents/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      category: category || 'other',
      description: description || '',
    });

    return { message: 'Document uploaded', data };
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  async findAll(
    @Query('familyId') familyId: string,
    @Query('category') category: string,
  ) {
    const data = await this.docService.findAll(familyId, category);
    return { message: 'Documents', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async remove(@Param('id') id: string, @Query('familyId') familyId: string) {
    await this.docService.delete(id, familyId);
    return { message: 'Document deleted', data: null };
  }
}
