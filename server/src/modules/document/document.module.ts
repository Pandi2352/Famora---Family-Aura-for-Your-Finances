import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinDocument, FinDocumentSchema } from './document.schema';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FinDocument.name, schema: FinDocumentSchema }])],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
