import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string; email: string; name: string };
}

@ApiTags('Family')
@Controller('family')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all families the user belongs to' })
  async myFamilies(@Req() req: AuthRequest) {
    const families = await this.familyService.getUserFamilies(req.user.id);
    return { message: 'User families', data: families };
  }

  @Get(':familyId')
  @ApiOperation({ summary: 'Get family details with all members' })
  async familyDetails(
    @Param('familyId') familyId: string,
    @Req() req: AuthRequest,
  ) {
    const details = await this.familyService.getFamilyDetails(
      familyId,
      req.user.id,
    );
    return { message: 'Family details', data: details };
  }

  @Patch(':familyId')
  @ApiOperation({ summary: 'Update family name and/or slogan' })
  async updateFamily(
    @Param('familyId') familyId: string,
    @Body() dto: UpdateFamilyDto,
    @Req() req: AuthRequest,
  ) {
    return this.familyService.updateFamily(familyId, req.user.id, dto);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a member to family. Sends email with temp password.' })
  async inviteMember(
    @Body() dto: InviteMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.familyService.inviteMember(dto, req.user.id);
  }

  @Delete(':familyId/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from family' })
  async removeMember(
    @Param('familyId') familyId: string,
    @Param('memberId') memberId: string,
    @Req() req: AuthRequest,
  ) {
    return this.familyService.removeMember(familyId, memberId, req.user.id);
  }
}
