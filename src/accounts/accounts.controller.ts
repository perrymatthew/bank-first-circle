import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  async createAccount(
    @Body() body: { ownerName: string; initialDeposit: number },
  ) {
    return this.accountsService.createAccount(
      body.ownerName,
      body.initialDeposit,
    );
  }

  @Get(':id')
  async getAccount(@Param('id') id: number) {
    return this.accountsService.getAccountById(id);
  }

  @Post(':id/deposit')
  async deposit(@Param('id') id: number, @Body() body: { amount: number }) {
    return this.accountsService.deposit(id, body.amount);
  }

  @Post(':id/withdraw')
  async withdraw(@Param('id') id: number, @Body() body: { amount: number }) {
    return this.accountsService.withdraw(id, body.amount);
  }

  @Post('transfer')
  async transfer(
    @Body() body: { fromId: number; toId: number; amount: number },
  ) {
    return this.accountsService.transfer(body.fromId, body.toId, body.amount);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: number) {
    return this.accountsService.getBalance(id);
  }
}
