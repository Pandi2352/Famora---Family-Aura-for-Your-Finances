import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activity')
@Controller('activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get family activity feed' })
  async getFeed(
    @Query('familyId') familyId: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    const data = await this.activityService.getFeed(
      familyId,
      parseInt(limit, 10) || 20,
      parseInt(page, 10) || 1,
    );
    return { message: 'Activity feed', data };
  }
}
