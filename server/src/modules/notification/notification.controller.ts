import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest { user: { id: string } }

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notifService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async list(@Req() req: AuthRequest, @Query('limit') limit: string) {
    const data = await this.notifService.getForUser(req.user.id, parseInt(limit, 10) || 20);
    return { message: 'Notifications', data };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Req() req: AuthRequest) {
    const count = await this.notifService.getUnreadCount(req.user.id);
    return { message: 'Unread count', data: { count } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @Req() req: AuthRequest) {
    await this.notifService.markRead(id, req.user.id);
    return { message: 'Marked as read', data: null };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: AuthRequest) {
    await this.notifService.markAllRead(req.user.id);
    return { message: 'All marked as read', data: null };
  }
}
