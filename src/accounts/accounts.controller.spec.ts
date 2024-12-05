import { Test, TestingModule } from '@nestjs/testing';

import { AccountEntity } from '../entities/account.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            createAccount: jest.fn(),
            getAccountById: jest.fn(),
            deposit: jest.fn(),
            withdraw: jest.fn(),
            transfer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
  });

  describe('createAccount', () => {
    it('should create an account', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };

      jest.spyOn(service, 'createAccount').mockResolvedValue(mockAccount);

      const result = await controller.createAccount({
        ownerName: 'John Doe',
        initialDeposit: 1000,
      });

      expect(result).toEqual(mockAccount);
      expect(service.createAccount).toHaveBeenCalledWith('John Doe', 1000);
    });
  });

  describe('getAccountById', () => {
    it('should return an account by ID', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 1000,
      };

      jest.spyOn(service, 'getAccountById').mockResolvedValue(mockAccount);

      const result = await controller.getAccount(1);

      expect(result).toEqual(mockAccount);
      expect(service.getAccountById).toHaveBeenCalledWith(1);
    });
  });

  describe('deposit', () => {
    it('should deposit money into an account', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 2000,
      };

      jest.spyOn(service, 'deposit').mockResolvedValue(mockAccount);

      const result = await controller.deposit(1, { amount: 1000 });

      expect(result).toEqual(mockAccount);
      expect(service.deposit).toHaveBeenCalledWith(1, 1000);
    });
  });

  describe('withdraw', () => {
    it('should withdraw money from an account', async () => {
      const mockAccount: AccountEntity = {
        id: 1,
        ownerName: 'John Doe',
        balance: 500,
      };

      jest.spyOn(service, 'withdraw').mockResolvedValue(mockAccount);

      const result = await controller.withdraw(1, { amount: 500 });

      expect(result).toEqual(mockAccount);
      expect(service.withdraw).toHaveBeenCalledWith(1, 500);
    });
  });

  describe('transfer', () => {
    it('should transfer money between accounts', async () => {
      jest.spyOn(service, 'transfer').mockResolvedValue(500);

      const result = await controller.transfer({
        fromId: 1,
        toId: 2,
        amount: 500,
      });

      expect(result).toEqual(500);
      expect(service.transfer).toHaveBeenCalledWith(1, 2, 500);
    });
  });
});
