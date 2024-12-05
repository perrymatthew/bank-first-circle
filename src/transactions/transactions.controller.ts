import { Controller, Get, Query } from '@nestjs/common';
import { DateTime } from 'luxon';
import { GetTransactionsRequest } from '../models/get-transactions.request.model';

import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get('/')
  async getTransactions(
    @Query() request: GetTransactionsRequest,
  ): Promise<TransactionEntity[]> {
    const start = request.startDate
      ? DateTime.fromISO(request.startDate).toJSDate()
      : undefined;
    const end = request.endDate
      ? DateTime.fromISO(request.endDate).toJSDate()
      : undefined;

    return this.transactionService.getTransactions({
      start,
      end,
      fromAccountId: request.fromAccountId,
      toAccountId: request.toAccountId,
    });
  }
}
