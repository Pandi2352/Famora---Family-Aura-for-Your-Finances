import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from './activity.schema';
import { FamilyMember, FamilyMemberSchema } from '../family/family.schema';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
    UserModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
