import {
  Controller, Post, Body, UseGuards, Req, UseInterceptors,
  UploadedFile, BadRequestException, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { readFileSync } from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpenseService } from '../expense/expense.service';
import { parseBankCsv, ParsedTransaction } from './csv-parser';
import { generateUUID } from '../../utils/uuid';

interface AuthRequest {
  user: { id: string; email: string; name: string };
}

@ApiTags('Import')
@Controller('import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImportController {
  constructor(private expenseService: ExpenseService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Upload and parse a bank statement CSV. Returns parsed transactions for review.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'statements'),
        filename: (_req, file, cb) => cb(null, `${generateUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
        // Also check extension
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(file.mimetype) || ext === '.csv' || ext === '.txt');
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async parseStatement(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please upload a CSV file.');
    }

    const content = readFileSync(file.path, 'utf-8');
    const parsed = parseBankCsv(content);

    if (parsed.length === 0) {
      throw new BadRequestException(
        'Could not parse any transactions. Make sure the CSV has Date, Description, and Amount/Debit/Credit columns.',
      );
    }

    return {
      message: `Parsed ${parsed.length} transactions`,
      data: {
        transactions: parsed,
        fileName: file.originalname,
        totalCount: parsed.length,
        incomeCount: parsed.filter((t) => t.type === 'income').length,
        expenseCount: parsed.filter((t) => t.type === 'expense').length,
      },
    };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Import confirmed/edited transactions into the family' })
  async confirmImport(
    @Body() body: { familyId: string; transactions: ParsedTransaction[] },
    @Req() req: AuthRequest,
  ) {
    const { familyId, transactions } = body;
    if (!familyId || !transactions?.length) {
      throw new BadRequestException('familyId and transactions are required');
    }

    let imported = 0;

    for (const tx of transactions) {
      try {
        await this.expenseService.create(
          {
            type: tx.type,
            amount: tx.amount,
            category: tx.category,
            note: tx.description,
            date: tx.date,
            paymentMethod: 'bank_transfer',
            familyId,
          },
          req.user.id,
        );
        imported++;
      } catch {
        // Skip failed ones silently
      }
    }

    return {
      message: `Successfully imported ${imported} of ${transactions.length} transactions`,
      data: { imported, total: transactions.length },
    };
  }
}
