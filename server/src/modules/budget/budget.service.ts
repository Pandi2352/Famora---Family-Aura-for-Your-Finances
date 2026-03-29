import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Budget, BudgetDocument } from './budget.schema';
import { Expense, ExpenseDocument } from '../expense/expense.schema';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'exceeded';

function getStatus(percentUsed: number): BudgetStatus {
  if (percentUsed > 100) return 'exceeded';
  if (percentUsed > 90) return 'danger';
  if (percentUsed > 70) return 'warning';
  return 'safe';
}

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(dto: CreateBudgetDto) {
    // Check duplicate
    const existing = await this.budgetModel.findOne({
      familyId: dto.familyId,
      category: dto.category,
      month: dto.month,
      year: dto.year,
    }).exec();

    if (existing) {
      throw new BadRequestException(
        `Budget for "${dto.category}" already exists for ${dto.month}/${dto.year}`,
      );
    }

    const budget = await this.budgetModel.create({
      familyId: dto.familyId,
      category: dto.category,
      limit: dto.limit,
      month: dto.month,
      year: dto.year,
    });

    return this.enrichBudget(budget);
  }

  async findAll(familyId: string, year: number, month: number) {
    const budgets = await this.budgetModel
      .find({ familyId, year, month })
      .lean()
      .exec();

    // Get actual spending per category for this month
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const spending = await this.expenseModel.aggregate([
      {
        $match: {
          familyId,
          type: 'expense',
          date: { $gte: start, $lte: end },
          category: { $in: budgets.map((b) => b.category) },
        },
      },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const spendingMap = new Map(spending.map((s) => [s._id, s.spent]));

    return budgets.map((b) => {
      const spent = spendingMap.get(b.category) || 0;
      const percentUsed = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      return {
        id: b._id,
        familyId: b.familyId,
        category: b.category,
        limit: b.limit,
        spent,
        remaining: b.limit - spent,
        percentUsed,
        status: getStatus(percentUsed),
        month: b.month,
        year: b.year,
      };
    });
  }

  async update(id: string, familyId: string, dto: UpdateBudgetDto) {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.familyId !== familyId) throw new NotFoundException('Budget not found');

    if (dto.limit !== undefined) budget.limit = dto.limit;
    if (dto.category !== undefined) budget.category = dto.category;
    await budget.save();

    return this.enrichBudget(budget);
  }

  async delete(id: string, familyId: string) {
    const budget = await this.budgetModel.findById(id).exec();
    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.familyId !== familyId) throw new NotFoundException('Budget not found');
    await this.budgetModel.findByIdAndDelete(id).exec();
  }

  /**
   * Overall budget summary for a month.
   */
  async getSummary(familyId: string, year: number, month: number) {
    const budgets = await this.findAll(familyId, year, month);

    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overBudget = budgets.filter((b) => b.status === 'exceeded').length;
    const warnings = budgets.filter((b) => b.status === 'warning' || b.status === 'danger').length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
      budgetCount: budgets.length,
      overBudgetCount: overBudget,
      warningCount: warnings,
    };
  }

  private async enrichBudget(budget: any) {
    const start = new Date(budget.year, budget.month - 1, 1);
    const end = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

    const result = await this.expenseModel.aggregate([
      {
        $match: {
          familyId: budget.familyId,
          type: 'expense',
          category: budget.category,
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, spent: { $sum: '$amount' } } },
    ]);

    const spent = result[0]?.spent || 0;
    const percentUsed = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;

    return {
      id: budget._id,
      familyId: budget.familyId,
      category: budget.category,
      limit: budget.limit,
      spent,
      remaining: budget.limit - spent,
      percentUsed,
      status: getStatus(percentUsed),
      month: budget.month,
      year: budget.year,
    };
  }
}
