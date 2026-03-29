import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goal, GoalDocument } from './goal.schema';
import { UserService } from '../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ContributeDto } from './dto/contribute.dto';
import { generateUUID } from '../../utils/uuid';

@Injectable()
export class GoalService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
    private userService: UserService,
    private activityService: ActivityService,
  ) {}

  private formatGoal(g: any) {
    const savedAmount = (g.contributions || []).reduce((s: number, c: any) => s + c.amount, 0);
    const percent = g.targetAmount > 0 ? Math.round((savedAmount / g.targetAmount) * 100) : 0;
    return {
      id: g._id,
      familyId: g.familyId,
      title: g.title,
      description: g.description || '',
      targetAmount: g.targetAmount,
      savedAmount,
      percent,
      remaining: g.targetAmount - savedAmount,
      deadline: g.deadline,
      priority: g.priority,
      color: g.color,
      contributions: (g.contributions || []).map((c: any) => ({
        id: c._id,
        amount: c.amount,
        contributedBy: c.contributedBy,
        note: c.note,
        date: c.date,
      })),
      isCompleted: g.isCompleted,
      completedAt: g.completedAt,
      createdAt: g.createdAt,
    };
  }

  async create(dto: CreateGoalDto) {
    const goal = await this.goalModel.create({
      familyId: dto.familyId,
      title: dto.title,
      description: dto.description || '',
      targetAmount: dto.targetAmount,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      priority: dto.priority || 'medium',
      color: dto.color || '#6366f1',
    });

    return this.formatGoal(goal);
  }

  async findAll(familyId: string) {
    const goals = await this.goalModel
      .find({ familyId })
      .sort({ isCompleted: 1, createdAt: -1 })
      .lean()
      .exec();

    return goals.map((g) => this.formatGoal(g));
  }

  async findById(id: string, familyId: string) {
    const goal = await this.goalModel.findById(id).lean().exec();
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.familyId !== familyId) throw new ForbiddenException('Access denied');
    return this.formatGoal(goal);
  }

  async update(id: string, familyId: string, dto: UpdateGoalDto) {
    const goal = await this.goalModel.findById(id).exec();
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.familyId !== familyId) throw new ForbiddenException('Access denied');

    if (dto.title !== undefined) goal.title = dto.title;
    if (dto.description !== undefined) goal.description = dto.description;
    if (dto.targetAmount !== undefined) goal.targetAmount = dto.targetAmount;
    if (dto.deadline !== undefined) goal.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.priority !== undefined) goal.priority = dto.priority as any;
    if (dto.color !== undefined) goal.color = dto.color;
    await goal.save();

    return this.formatGoal(goal);
  }

  async contribute(id: string, familyId: string, userId: string, dto: ContributeDto) {
    const goal = await this.goalModel.findById(id).exec();
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.familyId !== familyId) throw new ForbiddenException('Access denied');

    goal.contributions.push({
      _id: generateUUID(),
      amount: dto.amount,
      contributedBy: userId,
      note: dto.note || '',
      date: new Date(),
    } as any);

    // Check if goal is completed
    const totalSaved = goal.contributions.reduce((s, c) => s + c.amount, 0);
    if (totalSaved >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();

    // Log activity
    const user = await this.userService.findById(userId);
    this.activityService.log(familyId, userId, 'goal_contributed', {
      goalId: id,
      goalTitle: goal.title,
      amount: dto.amount,
      contributorName: user?.name || 'Unknown',
    });

    return this.formatGoal(goal);
  }

  async delete(id: string, familyId: string) {
    const goal = await this.goalModel.findById(id).exec();
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.familyId !== familyId) throw new ForbiddenException('Access denied');
    await this.goalModel.findByIdAndDelete(id).exec();
  }

  /**
   * Summary for dashboard.
   */
  async getSummary(familyId: string) {
    const goals = await this.goalModel.find({ familyId }).lean().exec();

    const active = goals.filter((g) => !g.isCompleted);
    const completed = goals.filter((g) => g.isCompleted);

    const totalTarget = active.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = active.reduce(
      (s, g) => s + (g.contributions || []).reduce((cs: number, c: any) => cs + c.amount, 0),
      0,
    );

    return {
      activeCount: active.length,
      completedCount: completed.length,
      totalTarget,
      totalSaved,
      overallPercent: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    };
  }
}
