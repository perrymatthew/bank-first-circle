import { DateTime } from 'luxon';

export interface TxnFilter {
  start?: DateTime;
  end?: DateTime;
  fromAccountId?: number;
  toAccountId?: number;
}
