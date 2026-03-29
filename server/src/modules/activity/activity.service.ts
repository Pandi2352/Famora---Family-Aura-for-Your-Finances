import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument, ActivityType } from './activity.schema';
import { UserService } from '../user/user.service';
import { FamilyMember, FamilyMemberDocument } from '../family/family.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(FamilyMember.name) private memberModel: Model<FamilyMemberDocument>,
    private userService: UserService,
  ) {}

  async log(
    familyId: string,
    userId: string,
    type: ActivityType,
    meta: Record<string, any> = {},
  ) {
    await this.activityModel.create({ familyId, userId, type, meta });
  }

  async getFeed(familyId: string, limit = 20, page = 1) {
    const skip = (page - 1) * limit;

    const activities = await this.activityModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Batch fetch user info
    const userIds = [...new Set(activities.map((a) => a.userId))];
    const [users, memberships] = await Promise.all([
      Promise.all(userIds.map((id) => this.userService.findById(id))),
      this.memberModel.find({ familyId, userId: { $in: userIds } }).lean().exec(),
    ]);

    const userMap = new Map(users.filter(Boolean).map((u) => [String(u!._id), u!]));
    const memberMap = new Map(memberships.map((m) => [String(m.userId), m]));

    return activities.map((a) => {
      const user = userMap.get(String(a.userId));
      const membership = memberMap.get(String(a.userId));
      return {
        id: a._id,
        type: a.type,
        userName: user?.name || 'Unknown',
        userRelationship: membership?.relationship || 'other',
        meta: a.meta,
        createdAt: a.createdAt,
      };
    });
  }
}
