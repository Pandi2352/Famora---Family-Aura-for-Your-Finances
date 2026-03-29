import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMTPEmailer, EmailConfig } from 'my-utils-helpers';
import { inviteTemplate } from './templates/invite.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly emailConfig: EmailConfig;

  constructor(private config: ConfigService) {
    this.emailConfig = {
      provider: this.config.get<string>('SMTP_PROVIDER', 'gmail'),
      host_name: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      host_port: this.config.get<number>('SMTP_PORT', 587),
      client_id: this.config.get<string>('SMTP_USER', ''),
      client_secret: this.config.get<string>('SMTP_PASS', ''),
      from: this.config.get<string>('SMTP_FROM', 'noreply@famora.app'),
    };
  }

  async sendInviteEmail(data: {
    to: string;
    inviterName: string;
    familyName: string;
    relationship: string;
    tempPassword: string;
  }): Promise<void> {
    const loginUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    ) + '/login';

    try {
      await SMTPEmailer.Instance.sendTemplateEmail({
        email_config: this.emailConfig,
        to: data.to,
        subject: `${data.inviterName} invited you to join ${data.familyName} on Famora`,
        template: inviteTemplate,
        data: {
          inviter_name: data.inviterName,
          family_name: data.familyName,
          relationship: data.relationship,
          email: data.to,
          temp_password: data.tempPassword,
          login_url: loginUrl,
        },
      });
      this.logger.log(`Invite email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${data.to}`, error);
      // Don't throw — invite still succeeds, email is best-effort
    }
  }
}
