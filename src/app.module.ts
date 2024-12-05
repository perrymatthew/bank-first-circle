import { AccountEntity } from './entities/account.entity';
import { AccountsModule } from './accounts/accounts.module';
import { Module } from '@nestjs/common';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'bank.db',
      entities: [AccountEntity, TransactionEntity],
      synchronize: true,
    }),
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
