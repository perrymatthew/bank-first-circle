import { Test, TestingModule } from '@nestjs/testing';

import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TxnFilter } from '../models/txn-filter.model';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            getTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('getTransactions', () => {
    const mockTransactions: TransactionEntity[] = [
      {
        txnId: crypto.randomUUID(),
        fromAccount: { id: 1, balance: 1000, ownerName: 'John Doe' },
        toAccount: { id: 2, balance: 500, ownerName: 'Jane Doe' },
        txnType: TransactionType.TRANSFER,
        amount: 100,
        createdAt: '2024-12-02',
      },
    ];

    beforeEach(() => {
      jest
        .spyOn(service, 'getTransactions')
        .mockResolvedValue(mockTransactions);
    });

    it('should return a ledger of all transactions if no filter is provided', async () => {
      const request: TxnFilter = {
        start: undefined,
        end: undefined,
        fromAccountId: undefined,
        toAccountId: undefined,
      };
      const result = await controller.getTransactions(request);

      expect(result).toEqual(mockTransactions);
      expect(service.getTransactions).toHaveBeenCalledWith(request);
    });

    it('should return a filtered ledger of transactions for a specific date range', async () => {
      const request: TxnFilter = {
        start: '2024-12-01',
        end: '2024-12-04',
        fromAccountId: undefined,
        toAccountId: undefined,
      };

      const result = await controller.getTransactions(request);

      expect(result).toEqual(mockTransactions);
    });
  });
});
