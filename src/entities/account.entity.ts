import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerName: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0.0 })
  balance: number;
}
