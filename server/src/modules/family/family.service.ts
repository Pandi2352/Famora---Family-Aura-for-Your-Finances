import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RandomNumberGenerator } from 'my-utils-helpers';
import {
  Family,
  FamilyDocument,
  FamilyMember,
  FamilyMemberDocument,
} from './family.schema';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { InviteMemberDto } from './dto/invite-member.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class FamilyService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMember.name) private memberModel: Model<FamilyMemberDocument>,
    private userService: UserService,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new family and add the owner as the first member.
   */
  async createFamily(data: {
    name: string;
    ownerId: string;
    ownerName: string;
  }): Promise<FamilyDocument> {
    const family = await this.familyModel.create({
      name: data.name,
      ownerId: data.ownerId,
    });

    await this.memberModel.create({
      familyId: family._id,
      userId: data.ownerId,
      relationship: 'other',
    });

    return family;
  }

  /**
   * Get all families a user belongs to, with member count.
   */
  async getUserFamilies(userId: string) {
    const memberships = await this.memberModel.find({ userId }).lean().exec();
    const familyIds = memberships.map((m) => m.familyId);

    const families = await this.familyModel
      .find({ _id: { $in: familyIds } })
      .lean()
      .exec();

    const result = await Promise.all(
      families.map(async (f) => {
        const memberCount = await this.memberModel.countDocuments({
          familyId: f._id,
        });
        const membership = memberships.find((m) => m.familyId === f._id);
        return {
          id: f._id,
          name: f.name,
          slogan: (f as any).slogan || null,
          ownerId: f.ownerId,
          relationship: membership?.relationship,
          memberCount,
          createdAt: f.createdAt,
        };
      }),
    );

    return result;
  }

  /**
   * Update family name and/or slogan. Any member can update.
   */
  async updateFamily(
    familyId: string,
    requesterId: string,
    data: { name?: string; slogan?: string },
  ) {
    const family = await this.familyModel.findById(familyId).exec();
    if (!family) throw new NotFoundException('Family not found');

    // Verify requester is a member
    const membership = await this.memberModel
      .findOne({ familyId, userId: requesterId })
      .lean()
      .exec();
    if (!membership) {
      throw new ForbiddenException('You are not a member of this family');
    }

    if (data.name !== undefined) family.name = data.name;
    if (data.slogan !== undefined) (family as any).slogan = data.slogan;
    await family.save();

    return {
      message: 'Family updated',
      data: {
        id: family._id,
        name: family.name,
        slogan: (family as any).slogan,
      },
    };
  }

  /**
   * Get family details with all members.
   */
  async getFamilyDetails(familyId: string, requesterId: string) {
    const family = await this.familyModel.findById(familyId).lean().exec();
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    const requesterMembership = await this.memberModel
      .findOne({ familyId, userId: requesterId })
      .lean()
      .exec();
    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this family');
    }

    const members = await this.memberModel.find({ familyId }).lean().exec();
    const memberDetails = await Promise.all(
      members.map(async (m) => {
        const user = await this.userService.findById(m.userId);
        return {
          id: m._id,
          userId: m.userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          avatar: user?.avatar || null,
          relationship: m.relationship,
          joinedAt: m.joinedAt,
        };
      }),
    );

    return {
      id: family._id,
      name: family.name,
      ownerId: family.ownerId,
      members: memberDetails,
      createdAt: family.createdAt,
    };
  }

  /**
   * Invite a member to a family. Any member can invite.
   * Creates user with temp password → sends email → adds as member.
   */
  async inviteMember(dto: InviteMemberDto, inviterId: string) {
    const family = await this.familyModel.findById(dto.familyId).lean().exec();
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    // Verify inviter is a member of this family
    const inviterMembership = await this.memberModel
      .findOne({ familyId: dto.familyId, userId: inviterId })
      .lean()
      .exec();
    if (!inviterMembership) {
      throw new ForbiddenException('You are not a member of this family');
    }

    // Check if user already exists
    let user = await this.userService.findByEmail(dto.email);
    const tempPassword = RandomNumberGenerator.getRandomNumber(8);

    if (!user) {
      const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);
      user = await this.userService.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isTemporaryPassword: true,
      });
    } else {
      const existingMember = await this.memberModel
        .findOne({ familyId: dto.familyId, userId: user._id })
        .lean()
        .exec();
      if (existingMember) {
        throw new BadRequestException('This user is already a family member');
      }
    }

    const member = await this.memberModel.create({
      familyId: dto.familyId,
      userId: user._id,
      relationship: dto.relationship,
    });

    const inviter = await this.userService.findById(inviterId);

    await this.emailService.sendInviteEmail({
      to: dto.email,
      inviterName: inviter?.name || 'A family member',
      familyName: family.name,
      relationship: dto.relationship,
      tempPassword,
    });

    return {
      message: `Invitation sent to ${dto.email}`,
      data: {
        memberId: member._id,
        userId: user._id,
        name: dto.name,
        email: dto.email,
        relationship: dto.relationship,
      },
    };
  }

  /**
   * Remove a member from a family. Any member can remove others.
   * Cannot remove yourself.
   */
  async removeMember(
    familyId: string,
    memberId: string,
    requesterId: string,
  ) {
    const family = await this.familyModel.findById(familyId).lean().exec();
    if (!family) {
      throw new NotFoundException('Family not found');
    }

    // Verify requester is a member
    const requester = await this.memberModel
      .findOne({ familyId, userId: requesterId })
      .lean()
      .exec();
    if (!requester) {
      throw new ForbiddenException('You are not a member of this family');
    }

    const member = await this.memberModel.findById(memberId).lean().exec();
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Cannot remove yourself
    if (member.userId === requesterId) {
      throw new BadRequestException('You cannot remove yourself');
    }

    await this.memberModel.findByIdAndDelete(memberId).exec();

    return {
      message: 'Member removed from family',
      data: null,
    };
  }
}
