import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './expense.schema';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { UserModule } from '../user/user.module';
import { FamilyMember, FamilyMemberSchema } from '../family/family.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: FamilyMember.name, schema: FamilyMemberSchema },
    ]),
    UserModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
