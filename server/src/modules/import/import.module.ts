import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [ExpenseModule],
  controllers: [ImportController],
})
export class ImportModule {}
