import { AccountEntity } from '../entities/account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TransactionsModule, TypeOrmModule.forFeature([AccountEntity])],
  providers: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
