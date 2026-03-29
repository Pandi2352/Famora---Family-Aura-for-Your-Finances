import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private subService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Add a subscription' })
  async create(@Body() dto: CreateSubscriptionDto) {
    const data = await this.subService.create(dto);
    return { message: 'Subscription added', data };
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async findAll(@Query('familyId') familyId: string) {
    const data = await this.subService.findAll(familyId);
    return { message: 'Subscriptions', data };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Subscription summary (monthly total, upcoming)' })
  async summary(@Query('familyId') familyId: string) {
    const data = await this.subService.getSummary(familyId);
    return { message: 'Subscription summary', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  async update(@Param('id') id: string, @Query('familyId') familyId: string, @Body() dto: UpdateSubscriptionDto) {
    const data = await this.subService.update(id, familyId, dto);
    return { message: 'Subscription updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  async remove(@Param('id') id: string, @Query('familyId') familyId: string) {
    await this.subService.delete(id, familyId);
    return { message: 'Subscription deleted', data: null };
  }
}
