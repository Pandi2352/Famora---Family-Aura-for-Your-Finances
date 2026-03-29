import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notification.schema';
import { FamilyMember, FamilyMemberDocument } from '../family/family.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<NotificationDocument>,
    @InjectModel(FamilyMember.name) private memberModel: Model<FamilyMemberDocument>,
  ) {}

  /**
   * Send notification to a specific user.
   */
  async notify(
    userId: string,
    familyId: string,
    type: NotificationType,
    title: string,
    message: string,
    meta: Record<string, any> = {},
  ) {
    await this.notifModel.create({ userId, familyId, type, title, message, meta });
  }

  /**
   * Send notification to all family members.
   */
  async notifyFamily(
    familyId: string,
    type: NotificationType,
    title: string,
    message: string,
    meta: Record<string, any> = {},
  ) {
    const members = await this.memberModel.find({ familyId }).lean().exec();
    const docs = members.map((m) => ({
      userId: m.userId,
      familyId,
      type,
      title,
      message,
      meta,
    }));
    if (docs.length > 0) {
      await this.notifModel.insertMany(docs);
    }
  }

  async getForUser(userId: string, limit = 20) {
    const notifications = await this.notifModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return notifications.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      meta: n.meta,
      createdAt: n.createdAt,
    }));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifModel.countDocuments({ userId, isRead: false }).exec();
  }

  async markRead(id: string, userId: string) {
    await this.notifModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
    ).exec();
  }

  async markAllRead(userId: string) {
    await this.notifModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    ).exec();
  }
}
