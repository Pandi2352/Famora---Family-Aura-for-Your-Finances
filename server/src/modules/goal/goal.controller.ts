import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ContributeDto } from './dto/contribute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest {
  user: { id: string; email: string; name: string };
}

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalController {
  constructor(private goalService: GoalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a savings goal' })
  async create(@Body() dto: CreateGoalDto) {
    const data = await this.goalService.create(dto);
    return { message: 'Goal created', data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for a family' })
  async findAll(@Query('familyId') familyId: string) {
    const data = await this.goalService.findAll(familyId);
    return { message: 'Goals', data };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Goals summary (for dashboard)' })
  async summary(@Query('familyId') familyId: string) {
    const data = await this.goalService.getSummary(familyId);
    return { message: 'Goals summary', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single goal with contributions' })
  async findOne(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
  ) {
    const data = await this.goalService.findById(id, familyId);
    return { message: 'Goal detail', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  async update(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Body() dto: UpdateGoalDto,
  ) {
    const data = await this.goalService.update(id, familyId, dto);
    return { message: 'Goal updated', data };
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add a contribution to a goal' })
  async contribute(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
    @Body() dto: ContributeDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.goalService.contribute(id, familyId, req.user.id, dto);
    return { message: 'Contribution added', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  async remove(
    @Param('id') id: string,
    @Query('familyId') familyId: string,
  ) {
    await this.goalService.delete(id, familyId);
    return { message: 'Goal deleted', data: null };
  }
}
