import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../entities/account.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly transactionService: TransactionsService,
  ) {}

  async createAccount(
    ownerName: string,
    initialDeposit: number,
  ): Promise<AccountEntity> {
    if (initialDeposit < 0) {
      throw new BadRequestException('Initial deposit cannot be negative.');
    }
    const account = this.accountRepository.create({
      ownerName,
      balance: initialDeposit,
    });
    this.transactionService.logTransaction(
      TransactionType.DEPOSIT,
      initialDeposit,
      account,
    );
    return this.accountRepository.save(account);
  }

  async getAccountById(id: number): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found.');
    return account;
  }

  async deposit(id: number, amount: number): Promise<AccountEntity> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Deposit amount must be greater than zero.',
      );
    }
    const account = await this.getAccountById(id);
    account.balance += amount;
    this.transactionService.logTransaction(
      TransactionType.DEPOSIT,
      amount,
      account,
    );
    return this.accountRepository.save(account);
  }

  async withdraw(id: number, amount: number): Promise<AccountEntity> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Withdrawal amount must be greater than zero.',
      );
    }
    const account = await this.getAccountById(id);
    if (account.balance < amount) {
      throw new BadRequestException('Insufficient funds.');
    }
    account.balance -= amount;

    await this.transactionService.logTransaction(
      TransactionType.WITHDRAWAL,
      amount,
      account,
      null,
    );

    return this.accountRepository.save(account);
  }

  async transfer(
    fromId: number,
    toId: number,
    amount: number,
  ): Promise<number> {
    if (amount <= 0) {
      throw new BadRequestException(
        'Transfer amount must be greater than zero.',
      );
    }

    const fromAccount = await this.getAccountById(fromId);
    const toAccount = await this.getAccountById(toId);

    if (fromAccount.id === toAccount.id) {
      throw new BadRequestException('Cannot transfer to the same account.');
    }

    if (fromAccount.balance < amount) {
      throw new BadRequestException('Insufficient funds for transfer.');
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    await this.transactionService.logTransaction(
      TransactionType.TRANSFER,
      amount,
      fromAccount,
      toAccount,
    );

    return fromAccount.balance;
  }

  async getBalance(id: number): Promise<number> {
    const account = await this.getAccountById(id);
    return account.balance;
  }
}
