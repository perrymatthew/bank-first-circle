import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AccountEntity } from './account.entity';
import { DateTime } from 'luxon';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  txnId: string;

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
  fromAccount: AccountEntity;

  @ManyToOne(() => AccountEntity, { nullable: true, onDelete: 'SET NULL' })
  toAccount: AccountEntity;

  @Column({
    type: 'varchar',
    enum: TransactionType,
  })
  txnType: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: DateTime;
}
