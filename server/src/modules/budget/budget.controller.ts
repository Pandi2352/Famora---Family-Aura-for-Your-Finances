import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a monthly budget for a category' })
  async create(@Body() dto: CreateBudgetDto) {
    const data = await this.budgetService.create(dto);
    return { message: 'Budget created', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for a month with spending status' })
  async findAll(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.budgetService.findAll(familyId, y, m);
    return { message: 'Budgets', data };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Overall budget summary for a month' })
  async summary(
    @Query('familyId') familyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = parseInt(year, 10) || new Date().getFullYear();
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const data = await this.budgetService.getSummary(familyId, y, m);
    return { message: 'Budget summary', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget limit or category' })
  async update(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const data = await this.budgetService.update(id, familyId, dto);
    return { message: 'Budget updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
  ) {
    await this.budgetService.delete(id, familyId);
    return { message: 'Budget deleted', data: null };
  }
}
