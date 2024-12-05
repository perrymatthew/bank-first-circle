import { Test, TestingModule } from '@nestjs/testing';

import { AccountEntity } from '../entities/account.entity';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let transactionRepository: Repository<TransactionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<TransactionEntity>>(
      getRepositoryToken(TransactionEntity),
    );
  });

  describe('logTransaction', () => {
    it('should log a deposit transaction successfully', async () => {
      const mockTransaction = {
        txnId: crypto.randomUUID(),
        txnType: TransactionType.DEPOSIT,
        amount: 1000,
        fromAccount: null,
        toAccount: { id: 2 },
        createdAt: DateTime.now().toJSDate(),
      } as TransactionEntity;

      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(mockTransaction);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(mockTransaction);

      const result = await transactionsService.logTransaction(
        TransactionType.DEPOSIT,
        1000,
        null,
        { id: 2 } as AccountEntity,
      );

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
    });

    it('should log a transfer transaction successfully', async () => {
      const mockTransaction = {
        txnId: crypto.randomUUID(),
        txnType: TransactionType.TRANSFER,
        amount: 500,
        fromAccount: { id: 1 },
        toAccount: { id: 2 },
        createdAt: DateTime.now().toJSDate(),
      } as TransactionEntity;

      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(mockTransaction);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(mockTransaction);

      const result = await transactionsService.logTransaction(
        TransactionType.TRANSFER,
        500,
        { id: 1 } as AccountEntity,
        { id: 2 } as AccountEntity,
      );

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions for a specific account', async () => {
      const mockTransactions = [
        {
          id: 1,
          txnType: TransactionType.DEPOSIT,
          amount: 1000,
          fromAccount: null,
          toAccount: { id: 2 },
          createdAt: DateTime.now().toJSDate(),
        },
        {
          id: 2,
          txnType: TransactionType.WITHDRAWAL,
          amount: 500,
          fromAccount: { id: 2 },
          toAccount: null,
          createdAt: DateTime.now().toJSDate(),
        },
      ];

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const queryBuilder: any = {
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(mockTransactions),
          };
          return queryBuilder;
        });

      const filter = {
        fromAccountId: 2,
        start: DateTime.now().minus({ days: 30 }).toISO(),
        end: DateTime.now().toISO(),
      };

      const result = await transactionsService.getTransactions(filter);

      expect(result).toEqual(mockTransactions);
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith(
        'transaction',
      );
    });

    it('should return transactions for a date range', async () => {
      const mockTransactions = [
        {
          id: 1,
          txnType: TransactionType.DEPOSIT,
          amount: 1000,
          fromAccount: null,
          toAccount: { id: 2 },
          createdAt: DateTime.now().toJSDate(),
        },
      ];

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const queryBuilder: any = {
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(mockTransactions),
          };
          return queryBuilder;
        });

      const filter = {
        start: DateTime.now().minus({ days: 10 }).toISO(),
        end: DateTime.now().toISO(),
      };

      const result = await transactionsService.getTransactions(filter);

      expect(result).toEqual(mockTransactions);
    });
  });
});
