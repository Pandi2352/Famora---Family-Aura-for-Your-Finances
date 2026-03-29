import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { FinDocument, FinDocumentDoc } from './document.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(FinDocument.name) private docModel: Model<FinDocumentDoc>,
  ) {}

  private format(d: any) {
    return {
      id: d._id,
      familyId: d.familyId,
      uploadedBy: d.uploadedBy,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      fileType: d.fileType,
      fileSize: d.fileSize,
      category: d.category,
      description: d.description,
      createdAt: d.createdAt,
    };
  }

  async upload(data: {
    familyId: string;
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    description: string;
  }) {
    const doc = await this.docModel.create(data);
    return this.format(doc);
  }

  async findAll(familyId: string, category?: string) {
    const filter: Record<string, any> = { familyId };
    if (category) filter.category = category;

    const docs = await this.docModel.find(filter).sort({ createdAt: -1 }).lean().exec();
    return docs.map((d) => this.format(d));
  }

  async delete(id: string, familyId: string) {
    const doc = await this.docModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.familyId !== familyId) throw new ForbiddenException('Access denied');

    // Delete file
    try {
      await unlink(join(process.cwd(), doc.fileUrl));
    } catch { /* ignore */ }

    await this.docModel.findByIdAndDelete(id).exec();
  }
}
