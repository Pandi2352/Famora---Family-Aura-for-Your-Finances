import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

function computeNextDueDate(dueDate: number, billingCycle: string): Date {
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), dueDate);
  if (next <= now) {
    if (billingCycle === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (billingCycle === 'quarterly') next.setMonth(next.getMonth() + 3);
    else next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
  ) {}

  private format(s: any) {
    const nextDue = s.nextDueDate ? new Date(s.nextDueDate) : computeNextDueDate(s.dueDate, s.billingCycle);
    return {
      id: s._id,
      familyId: s.familyId,
      name: s.name,
      amount: s.amount,
      category: s.category,
      billingCycle: s.billingCycle,
      dueDate: s.dueDate,
      nextDueDate: nextDue.toISOString(),
      daysUntilDue: daysUntil(nextDue),
      isActive: s.isActive,
      autoDebit: s.autoDebit,
      notes: s.notes,
      createdAt: s.createdAt,
    };
  }

  async create(dto: CreateSubscriptionDto) {
    const nextDueDate = computeNextDueDate(dto.dueDate, dto.billingCycle || 'monthly');
    const sub = await this.subModel.create({
      familyId: dto.familyId,
      name: dto.name,
      amount: dto.amount,
      category: dto.category || 'Other',
      billingCycle: dto.billingCycle || 'monthly',
      dueDate: dto.dueDate,
      nextDueDate,
      autoDebit: dto.autoDebit || false,
      notes: dto.notes || '',
    });
    return this.format(sub);
  }

  async findAll(familyId: string) {
    const subs = await this.subModel.find({ familyId }).sort({ isActive: -1, nextDueDate: 1 }).lean().exec();
    return subs.map((s) => this.format(s));
  }

  async update(id: string, familyId: string, dto: UpdateSubscriptionDto) {
    const sub = await this.subModel.findById(id).exec();
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.familyId !== familyId) throw new ForbiddenException('Access denied');

    if (dto.name !== undefined) sub.name = dto.name;
    if (dto.amount !== undefined) sub.amount = dto.amount;
    if (dto.category !== undefined) sub.category = dto.category;
    if (dto.billingCycle !== undefined) sub.billingCycle = dto.billingCycle as any;
    if (dto.dueDate !== undefined) sub.dueDate = dto.dueDate;
    if (dto.isActive !== undefined) sub.isActive = dto.isActive;
    if (dto.autoDebit !== undefined) sub.autoDebit = dto.autoDebit;
    if (dto.notes !== undefined) sub.notes = dto.notes;

    if (dto.dueDate !== undefined || dto.billingCycle !== undefined) {
      sub.nextDueDate = computeNextDueDate(sub.dueDate, sub.billingCycle);
    }

    await sub.save();
    return this.format(sub);
  }

  async delete(id: string, familyId: string) {
    const sub = await this.subModel.findById(id).exec();
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.familyId !== familyId) throw new ForbiddenException('Access denied');
    await this.subModel.findByIdAndDelete(id).exec();
  }

  async getSummary(familyId: string) {
    const subs = await this.subModel.find({ familyId, isActive: true }).lean().exec();

    const monthlyTotal = subs.reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
      return sum + s.amount / 12;
    }, 0);

    const upcoming = subs
      .map((s) => this.format(s))
      .filter((s) => s.daysUntilDue >= 0 && s.daysUntilDue <= 7);

    return {
      activeCount: subs.length,
      monthlyTotal: Math.round(monthlyTotal),
      dueThisWeek: upcoming.length,
      upcoming: upcoming.slice(0, 3),
    };
  }
}
