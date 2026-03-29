import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './expense.schema';
import { FamilyMember, FamilyMemberDocument } from '../family/family.schema';
import { UserService } from '../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(FamilyMember.name) private memberModel: Model<FamilyMemberDocument>,
    private userService: UserService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Enrich an expense with creator name + relationship.
   */
  private async enrichExpense(e: any, familyId: string) {
    const user = await this.userService.findById(e.createdBy);
    const membership = await this.memberModel
      .findOne({ familyId, userId: e.createdBy })
      .lean()
      .exec();

    return {
      id: e._id,
      familyId: e.familyId,
      createdBy: e.createdBy,
      creatorName: user?.name || 'Unknown',
      creatorRelationship: membership?.relationship || 'other',
      type: e.type,
      amount: e.amount,
      category: e.category,
      note: e.note,
      date: e.date,
      paymentMethod: e.paymentMethod,
      reactions: e.reactions || [],
      isPinned: e.isPinned || false,
      receiptUrl: e.receiptUrl || null,
      createdAt: e.createdAt,
    };
  }

  /**
   * Batch enrich — caches user/member lookups for performance.
   */
  private async enrichExpenses(expenses: any[], familyId: string) {
    // Collect unique createdBy IDs
    const userIds = [...new Set(expenses.map((e) => e.createdBy))];

    // Batch fetch users and memberships
    const [users, memberships] = await Promise.all([
      Promise.all(userIds.map((id) => this.userService.findById(id))),
      this.memberModel.find({ familyId, userId: { $in: userIds } }).lean().exec(),
    ]);

    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u!]));
    const memberMap = new Map(memberships.map((m) => [m.userId, m]));

    return expenses.map((e) => {
      const user = userMap.get(e.createdBy);
      const membership = memberMap.get(e.createdBy);
      return {
        id: e._id,
        familyId: e.familyId,
        createdBy: e.createdBy,
        creatorName: user?.name || 'Unknown',
        creatorRelationship: membership?.relationship || 'other',
        type: e.type,
        amount: e.amount,
        category: e.category,
        note: e.note,
        date: e.date,
        paymentMethod: e.paymentMethod,
        reactions: e.reactions || [],
        isPinned: e.isPinned || false,
        receiptUrl: e.receiptUrl || null,
        createdAt: e.createdAt,
      };
    });
  }

  async create(dto: CreateExpenseDto, userId: string) {
    const expense = await this.expenseModel.create({
      familyId: dto.familyId,
      createdBy: userId,
      type: dto.type,
      amount: dto.amount,
      category: dto.category,
      note: dto.note || '',
      date: new Date(dto.date),
      paymentMethod: dto.paymentMethod || 'cash',
    });

    // Log activity
    this.activityService.log(dto.familyId, userId, 'expense_added', {
      expenseId: expense._id,
      type: dto.type,
      amount: dto.amount,
      category: dto.category,
    });

    // Notify family for large expenses
    if (dto.type === 'expense' && dto.amount >= 5000) {
      const user = await this.userService.findById(userId);
      this.notificationService.notifyFamily(
        dto.familyId,
        'expense_added',
        'Large expense added',
        `${user?.name || 'Someone'} added ₹${dto.amount.toLocaleString('en-IN')} for ${dto.category}`,
        { expenseId: expense._id, amount: dto.amount },
      ).catch(() => {});
    }

    return this.enrichExpense(expense, dto.familyId);
  }

  async findAll(query: QueryExpenseDto) {
    const filter: Record<string, any> = {
      familyId: query.familyId,
    };

    if (query.type) filter.type = query.type;
    if (query.category) filter.category = query.category;
    if (query.memberId) filter.createdBy = query.memberId;

    if (query.dateFrom || query.dateTo) {
      filter.date = {};
      if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.date.$lte = new Date(query.dateTo + 'T23:59:59.999Z');
    }

    if (query.search) {
      filter.note = { $regex: query.search, $options: 'i' };
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const sortField = query.sortBy === 'amount' ? 'amount' : 'date';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      this.expenseModel
        .find(filter)
        .sort({ isPinned: -1, [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.expenseModel.countDocuments(filter).exec(),
    ]);

    const enriched = await this.enrichExpenses(expenses, query.familyId);

    return {
      expenses: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, familyId: string) {
    const expense = await this.expenseModel.findById(id).lean().exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) {
      throw new ForbiddenException('Access denied');
    }
    return this.enrichExpense(expense, familyId);
  }

  async update(id: string, dto: UpdateExpenseDto, familyId: string) {
    const expense = await this.expenseModel.findById(id).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.type !== undefined) expense.type = dto.type;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.note !== undefined) expense.note = dto.note;
    if (dto.date !== undefined) expense.date = new Date(dto.date);
    if (dto.paymentMethod !== undefined) expense.paymentMethod = dto.paymentMethod as any;
    await expense.save();

    return this.enrichExpense(expense, familyId);
  }

  async delete(id: string, familyId: string, userId?: string) {
    const expense = await this.expenseModel.findById(id).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) {
      throw new ForbiddenException('Access denied');
    }

    const meta = {
      type: expense.type,
      amount: expense.amount,
      category: expense.category,
    };
    await this.expenseModel.findByIdAndDelete(id).exec();

    if (userId) {
      this.activityService.log(familyId, userId, 'expense_deleted', meta);
    }
  }

  async toggleReaction(expenseId: string, familyId: string, userId: string, emoji: string) {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) {
      throw new ForbiddenException('Access denied');
    }

    const reactions = expense.reactions || [];
    const existingIdx = reactions.findIndex(
      (r) => r.userId === userId && r.emoji === emoji,
    );

    if (existingIdx >= 0) {
      // Remove reaction (toggle off)
      reactions.splice(existingIdx, 1);
    } else {
      // Add reaction
      reactions.push({ userId, emoji });

      // Log activity
      this.activityService.log(familyId, userId, 'reaction_added', {
        expenseId,
        emoji,
        category: expense.category,
        amount: expense.amount,
      });
    }

    expense.reactions = reactions;
    await expense.save();

    return reactions;
  }

  async getMonthlySummary(familyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await this.expenseModel.aggregate([
      { $match: { familyId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income = result.find((r) => r._id === 'income');
    const expense = result.find((r) => r._id === 'expense');
    const totalIncome = income?.total || 0;
    const totalExpenses = expense?.total || 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0,
      transactionCount: (income?.count || 0) + (expense?.count || 0),
    };
  }

  async getCategoryBreakdown(familyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.expenseModel.aggregate([
      { $match: { familyId, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  }

  async getRecent(familyId: string, limit = 5) {
    const expenses = await this.expenseModel
      .find({ familyId })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return this.enrichExpenses(expenses, familyId);
  }

  /**
   * Monthly trends — last N months income vs expense.
   */
  async getMonthlyTrends(familyId: string, months = 6) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const result = await this.expenseModel.aggregate([
      { $match: { familyId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build month-by-month data
    const monthsData: { month: string; income: number; expense: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

      const inc = result.find((r) => r._id.year === y && r._id.month === m && r._id.type === 'income');
      const exp = result.find((r) => r._id.year === y && r._id.month === m && r._id.type === 'expense');

      monthsData.push({
        month: label,
        income: inc?.total || 0,
        expense: exp?.total || 0,
      });
    }

    return monthsData;
  }

  /**
   * Daily spending for a given month.
   */
  async getDailySpending(familyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const result = await this.expenseModel.aggregate([
      { $match: { familyId, type: 'expense', date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const daily: { day: number; amount: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const found = result.find((r) => r._id === d);
      daily.push({ day: d, amount: found?.total || 0 });
    }

    return daily;
  }

  /**
   * Spending per member for a given month.
   */
  async getMemberComparison(familyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await this.expenseModel.aggregate([
      { $match: { familyId, type: 'expense', date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$createdBy',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Enrich with user names
    const enriched = await Promise.all(
      result.map(async (r) => {
        const user = await this.userService.findById(r._id);
        const membership = await this.memberModel
          .findOne({ familyId, userId: r._id })
          .lean()
          .exec();
        return {
          userId: r._id,
          name: user?.name || 'Unknown',
          relationship: membership?.relationship || 'other',
          total: r.total,
          count: r.count,
        };
      }),
    );

    return enriched;
  }

  /**
   * Top expenses for a given month.
   */
  async getTopExpenses(familyId: string, year: number, month: number, limit = 5) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await this.expenseModel
      .find({ familyId, type: 'expense', date: { $gte: start, $lte: end } })
      .sort({ amount: -1 })
      .limit(limit)
      .lean()
      .exec();

    return this.enrichExpenses(expenses, familyId);
  }

  /**
   * Today's spending total.
   */
  async getTodaySpending(familyId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const result = await this.expenseModel.aggregate([
      { $match: { familyId, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    return {
      total: result[0]?.total || 0,
      count: result[0]?.count || 0,
    };
  }

  /**
   * Toggle pin on an expense.
   */
  async togglePin(expenseId: string, familyId: string) {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) throw new ForbiddenException('Access denied');

    expense.isPinned = !expense.isPinned;
    await expense.save();

    return { isPinned: expense.isPinned };
  }

  /**
   * Update receipt URL on an expense.
   */
  async updateReceiptUrl(expenseId: string, familyId: string, receiptUrl: string) {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    if (expense.familyId !== familyId) throw new ForbiddenException('Access denied');
    expense.receiptUrl = receiptUrl;
    await expense.save();
  }

  /**
   * Month-over-month comparison per category.
   */
  async getMonthComparison(familyId: string, year: number, month: number) {
    const curStart = new Date(year, month - 1, 1);
    const curEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

    const [current, previous] = await Promise.all([
      this.expenseModel.aggregate([
        { $match: { familyId, type: 'expense', date: { $gte: curStart, $lte: curEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
      this.expenseModel.aggregate([
        { $match: { familyId, type: 'expense', date: { $gte: prevStart, $lte: prevEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
    ]);

    const prevMap = new Map(previous.map((p) => [p._id, p.total]));
    const allCategories = new Set([
      ...current.map((c) => c._id),
      ...previous.map((p) => p._id),
    ]);

    const comparison = [...allCategories].map((cat) => {
      const cur = current.find((c) => c._id === cat)?.total || 0;
      const prev = prevMap.get(cat) || 0;
      const change = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0);
      return { category: cat, current: cur, previous: prev, change };
    }).sort((a, b) => b.current - a.current);

    // Also totals
    const totalCurrent = current.reduce((s, c) => s + c.total, 0);
    const totalPrevious = previous.reduce((s, p) => s + p.total, 0);
    const totalChange = totalPrevious > 0
      ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100)
      : (totalCurrent > 0 ? 100 : 0);

    return {
      categories: comparison,
      totalCurrent,
      totalPrevious,
      totalChange,
    };
  }

  /**
   * Family financial health score (0-100).
   */
  async getHealthScore(familyId: string, year: number, month: number) {
    const curStart = new Date(year, month - 1, 1);
    const curEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    // 1. Savings rate (40%)
    const summaryResult = await this.expenseModel.aggregate([
      { $match: { familyId, date: { $gte: curStart, $lte: curEnd } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const income = summaryResult.find((r) => r._id === 'income')?.total || 0;
    const expenses = summaryResult.find((r) => r._id === 'expense')?.total || 0;
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    // 50%+ savings = 100 score, 0% = 0, negative = 0
    const savingsScore = Math.max(0, Math.min(100, savingsRate * 200));

    // 2. Budget adherence (30%)
    // Import not available here, so calculate inline
    const BudgetModel = this.expenseModel.db.model('Budget');
    const budgets = await BudgetModel.find({ familyId, year, month }).lean().exec();
    let budgetScore = 100; // perfect if no budgets
    if (budgets.length > 0) {
      const budgetSpending = await this.expenseModel.aggregate([
        {
          $match: {
            familyId, type: 'expense', date: { $gte: curStart, $lte: curEnd },
            category: { $in: (budgets as any[]).map((b: any) => b.category) },
          },
        },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]);
      const spendMap = new Map(budgetSpending.map((s) => [s._id, s.spent]));
      const adherences = (budgets as any[]).map((b: any) => {
        const spent = spendMap.get(b.category) || 0;
        const pct = b.limit > 0 ? spent / b.limit : 0;
        return pct <= 1 ? 100 : Math.max(0, 100 - (pct - 1) * 100);
      });
      budgetScore = adherences.reduce((s, a) => s + a, 0) / adherences.length;
    }

    // 3. Goal progress (20%)
    const GoalModel = this.expenseModel.db.model('Goal');
    const goals = await GoalModel.find({ familyId, isCompleted: false }).lean().exec();
    let goalScore = 50; // neutral if no goals
    if (goals.length > 0) {
      const progresses = (goals as any[]).map((g: any) => {
        const saved = (g.contributions || []).reduce((s: number, c: any) => s + c.amount, 0);
        return g.targetAmount > 0 ? Math.min(100, (saved / g.targetAmount) * 100) : 0;
      });
      goalScore = progresses.reduce((s, p) => s + p, 0) / progresses.length;
    }

    // 4. Consistency (10%) — days with logged expenses
    const daysWithExpenses = await this.expenseModel.aggregate([
      { $match: { familyId, date: { $gte: curStart, $lte: curEnd } } },
      { $group: { _id: { $dayOfMonth: '$date' } } },
    ]);
    const today = new Date();
    const daysSoFar = today.getMonth() + 1 === month && today.getFullYear() === year
      ? today.getDate() : daysInMonth;
    const consistencyScore = daysSoFar > 0
      ? Math.min(100, (daysWithExpenses.length / daysSoFar) * 100)
      : 0;

    // Weighted total
    const total = Math.round(
      savingsScore * 0.4 +
      budgetScore * 0.3 +
      goalScore * 0.2 +
      consistencyScore * 0.1,
    );

    const label = total >= 80 ? 'Excellent' : total >= 60 ? 'Good' : total >= 40 ? 'Fair' : 'Needs Work';

    return {
      score: Math.min(100, Math.max(0, total)),
      label,
      breakdown: {
        savings: Math.round(savingsScore),
        budget: Math.round(budgetScore),
        goals: Math.round(goalScore),
        consistency: Math.round(consistencyScore),
      },
    };
  }

  /**
   * Export expenses as CSV string.
   */
  async exportCsv(familyId: string, dateFrom?: string, dateTo?: string) {
    const filter: Record<string, any> = { familyId };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    const expenses = await this.expenseModel
      .find(filter)
      .sort({ date: -1 })
      .lean()
      .exec();

    const enriched = await this.enrichExpenses(expenses, familyId);

    const header = 'Date,Type,Category,Amount,Note,Payment Method,Added By,Relationship';
    const rows = enriched.map((e) => {
      const date = new Date(e.date).toLocaleDateString('en-IN');
      const note = (e.note || '').replace(/,/g, ';').replace(/"/g, "'");
      return `${date},${e.type},${e.category},${e.amount},"${note}",${e.paymentMethod},${e.creatorName},${e.creatorRelationship}`;
    });

    return [header, ...rows].join('\n');
  }
}
