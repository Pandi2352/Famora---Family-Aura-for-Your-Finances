import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import { generateUUID } from '../../utils/uuid';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string; email: string; name: string };
}

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Add an expense or income entry' })
  async create(@Body() dto: CreateExpenseDto, @Req() req: AuthRequest) {
    const expense = await this.expenseService.create(dto, req.user.id);
    return { message: 'Expense added', data: expense };
  }

  @Get()
  @ApiOperation({ summary: 'List expenses with filters, search, pagination' })
  async findAll(@Query() query: QueryExpenseDto) {
    const result = await this.expenseService.findAll(query);
    return { message: 'Expenses', data: result };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Monthly summary (income, expenses, savings)' })
  async summary(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getMonthlySummary(familyId, y, m);
    return { message: 'Monthly summary', data };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Category breakdown for a month' })
  async categories(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getCategoryBreakdown(familyId, y, m);
    return { message: 'Category breakdown', data };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Recent expenses (for dashboard)' })
  async recent(
    @Query('familyId') familyId: string,
    @Query('limit') limit: string,
  ) {
    const data = await this.expenseService.getRecent(
      familyId,
      parseInt(limit, 10) || 5,
    );
    return { message: 'Recent expenses', data };
  }

  @Get('today')
  @ApiOperation({ summary: "Today's spending total" })
  async today(@Query('familyId') familyId: string) {
    const data = await this.expenseService.getTodaySpending(familyId);
    return { message: "Today's spending", data };
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Month-over-month spending comparison per category' })
  async comparison(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getMonthComparison(familyId, y, m);
    return { message: 'Month comparison', data };
  }

  @Get('health')
  @ApiOperation({ summary: 'Family financial health score (0-100)' })
  async healthScore(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getHealthScore(familyId, y, m);
    return { message: 'Health score', data };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transactions as CSV' })
  async exportCsv(
    @Query('familyId') familyId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Req() req: any,
  ) {
    const csv = await this.expenseService.exportCsv(familyId, dateFrom, dateTo);
    const res = req.res;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=famora-expenses.csv');
    res.send(csv);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Monthly income vs expense trends (last N months)' })
  async trends(
    @Query('familyId') familyId: string,
    @Query('months') months: string,
  ) {
    const data = await this.expenseService.getMonthlyTrends(
      familyId,
      parseInt(months, 10) || 6,
    );
    return { message: 'Monthly trends', data };
  }

  @Get('daily')
  @ApiOperation({ summary: 'Daily spending for a month' })
  async daily(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getDailySpending(familyId, y, m);
    return { message: 'Daily spending', data };
  }

  @Get('members')
  @ApiOperation({ summary: 'Spending comparison per family member' })
  async memberComparison(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getMemberComparison(familyId, y, m);
    return { message: 'Member comparison', data };
  }

  @Get('top')
  @ApiOperation({ summary: 'Top expenses by amount for a month' })
  async topExpenses(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('limit') limit: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.expenseService.getTopExpenses(
      familyId, y, m, parseInt(limit, 10) || 5,
    );
    return { message: 'Top expenses', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single expense by ID' })
  async findOne(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
  ) {
    const data = await this.expenseService.findById(id, familyId);
    return { message: 'Expense detail', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  async update(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    const data = await this.expenseService.update(id, dto, familyId);
    return { message: 'Expense updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  async remove(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Req() req: AuthRequest,
  ) {
    await this.expenseService.delete(id, familyId, req.user.id);
    return { message: 'Expense deleted', data: null };
  }

  @Post(':id/pin')
  @ApiOperation({ summary: 'Toggle pin on an expense' })
  async togglePin(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
  ) {
    const data = await this.expenseService.togglePin(id, familyId);
    return { message: 'Pin toggled', data };
  }

  @Post(':id/react')
  @ApiOperation({ summary: 'Toggle emoji reaction on an expense' })
  async react(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Body('emoji') emoji: string,
    @Req() req: AuthRequest,
  ) {
    const reactions = await this.expenseService.toggleReaction(
      id, familyId, req.user.id, emoji,
    );
    return { message: 'Reaction toggled', data: { reactions } };
  }

  @Post(':id/receipt')
  @ApiOperation({ summary: 'Upload receipt image for an expense' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'receipts'),
        filename: (_req, file, cb) => cb(null, `${generateUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadReceipt(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded. Allowed: JPG, PNG, WEBP, PDF (max 5MB)');
    const receiptUrl = `uploads/receipts/${file.filename}`;
    await this.expenseService.updateReceiptUrl(id, familyId, receiptUrl);
    return { message: 'Receipt uploaded', data: { receiptUrl } };
  }
}
