import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { AccountEntity } from '../entities/account.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TxnFilter } from '../models/txn-filter.model';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async logTransaction(
    txnType: TransactionType,
    amount: number,
    fromAccount?: AccountEntity,
    toAccount?: AccountEntity,
  ): Promise<TransactionEntity> {
    const transaction = this.transactionRepository.create({
      txnType,
      amount,
      fromAccount: fromAccount || null,
      toAccount: toAccount || null,
      createdAt: DateTime.now().toJSDate(),
    });
    return await this.transactionRepository.save(transaction);
  }

  async getTransactions(filter: TxnFilter): Promise<TransactionEntity[]> {
    const { start, end, fromAccountId, toAccountId } = filter;

    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (start) {
      query.andWhere('transaction.createdAt >= :start', { start });
    }

    if (end) {
      query.andWhere('transaction.createdAt <= :end', { end });
    }

    if (fromAccountId) {
      query.andWhere('transaction.fromAccountId = :fromAccountId', {
        fromAccountId,
      });
    }

    if (toAccountId) {
      query.andWhere('transaction.toAccountId = :toAccountId', { toAccountId });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    return query.getMany();
  }
}
