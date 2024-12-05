import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AccountEntity } from '../entities/account.entity';
import { AccountsService } from './accounts.service';
import { Repository } from 'typeorm';
import { TransactionEntity } from 'src/entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let transactionsService: TransactionsService;
  let accountRepository: Repository<AccountEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(AccountEntity),
          useClass: Repository,
        },
        {
          provide: TransactionsService,
          useValue: {
            logTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    accountRepository = module.get<Repository<AccountEntity>>(
      getRepositoryToken(AccountEntity),
    );
  });

  describe('createAccount', () => {
    it('should create an account with an initial deposit', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };
      jest.spyOn(accountRepository, 'create').mockReturnValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue(mockAccount);
      jest
        .spyOn(transactionsService, 'logTransaction')
        .mockResolvedValue({} as TransactionEntity);

      const result = await accountsService.createAccount('John Doe', 1000);

      expect(result).toEqual(mockAccount);
      expect(accountRepository.create).toHaveBeenCalledWith({
        ownerName: 'John Doe',
        balance: 1000,
      });
      expect(accountRepository.save).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw an error if initial deposit is negative', async () => {
      await expect(
        accountsService.createAccount('John Doe', -1000),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAccountById', () => {
    it('should return an account by ID', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(mockAccount);

      const result = await accountsService.getAccountById(1);

      expect(result).toEqual(mockAccount);
      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if account is not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValue(null);

      await expect(accountsService.getAccountById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deposit', () => {
    it('should deposit money into an account', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };
      jest
        .spyOn(accountsService, 'getAccountById')
        .mockResolvedValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue({
        ...mockAccount,
        balance: 2000,
      });
      jest
        .spyOn(transactionsService, 'logTransaction')
        .mockResolvedValue({} as TransactionEntity);

      const result = await accountsService.deposit(1, 1000);

      expect(result.balance).toEqual(2000);
      expect(accountRepository.save).toHaveBeenCalledWith({
        ...mockAccount,
        balance: 2000,
      });
    });

    it('should throw an error if deposit amount is not positive', async () => {
      await expect(accountsService.deposit(1, -500)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw money from an account', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };
      jest
        .spyOn(accountsService, 'getAccountById')
        .mockResolvedValue(mockAccount);
      jest.spyOn(accountRepository, 'save').mockResolvedValue({
        ...mockAccount,
        balance: 500,
      });
      jest
        .spyOn(transactionsService, 'logTransaction')
        .mockResolvedValue({} as TransactionEntity);

      const result = await accountsService.withdraw(1, 500);

      expect(result.balance).toEqual(500);
      expect(accountRepository.save).toHaveBeenCalledWith({
        ...mockAccount,
        balance: 500,
      });
      expect(transactionsService.logTransaction).toHaveBeenCalledWith(
        TransactionType.WITHDRAWAL,
        500,
        mockAccount,
        null,
      );
    });

    it('should throw an error if withdrawal amount exceeds balance', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        balance: 1000,
        ownerName: 'John Doe',
      };
      jest
        .spyOn(accountsService, 'getAccountById')
        .mockResolvedValue(mockAccount);

      await expect(accountsService.withdraw(1, 2000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('transfer', () => {
    it('should transfer money between accounts', async () => {
      const fromAccount = { id: 1, balance: 1000, ownerName: 'John Doe' };
      const toAccount = { id: 2, balance: 500, ownerName: 'Jane Doe' };

      jest
        .spyOn(accountsService, 'getAccountById')
        .mockImplementation(async (id: number) =>
          id === 1 ? fromAccount : toAccount,
        );
      jest
        .spyOn(accountRepository, 'save')
        .mockResolvedValue({} as AccountEntity);
      jest
        .spyOn(transactionsService, 'logTransaction')
        .mockResolvedValue({} as TransactionEntity);

      const result = await accountsService.transfer(1, 2, 500);

      expect(result).toEqual(500);
      expect(accountRepository.save).toHaveBeenCalledWith({
        ...fromAccount,
        balance: 500,
      });
      expect(accountRepository.save).toHaveBeenCalledWith({
        ...toAccount,
        balance: 1000,
      });
      expect(transactionsService.logTransaction).toHaveBeenCalledWith(
        TransactionType.TRANSFER,
        500,
        fromAccount,
        toAccount,
      );
    });

    it('should throw an error if transferring to the same account', async () => {
      const account: AccountEntity = {
        id: 1,
        balance: 1000,
        ownerName: 'John Doe',
      };
      jest.spyOn(accountsService, 'getAccountById').mockResolvedValue(account);
      await expect(accountsService.transfer(1, 1, 500)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
