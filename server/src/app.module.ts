import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { databaseConfig, swaggerConfig } from './config';
import { uuidPlugin } from './utils';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FamilyModule } from './modules/family/family.module';
import { EmailModule } from './modules/email/email.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { ActivityModule } from './modules/activity/activity.module';
import { BudgetModule } from './modules/budget/budget.module';
import { GoalModule } from './modules/goal/goal.module';
import { ImportModule } from './modules/import/import.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { DocumentModule } from './modules/document/document.module';
import { NotificationModule } from './modules/notification/notification.module';

// Apply UUID plugin globally — every schema gets UUID _id instead of ObjectId
mongoose.plugin(uuidPlugin);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, swaggerConfig],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),

    EmailModule,
    UserModule,
    AuthModule,
    FamilyModule,
    ExpenseModule,
    ActivityModule,
    BudgetModule,
    GoalModule,
    ImportModule,
    SubscriptionModule,
    DocumentModule,
    NotificationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
