import React from 'react';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { fetchTransactions } from '../api/transactions';
import type { TransactionListProps, Transaction } from '../types';

const TransactionList: React.FC<TransactionListProps> = ({ accountId, categoryId }) => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useQuery<Transaction[], Error>(
    ['transactions', accountId, categoryId],
    () => fetchTransactions({ accountId, categoryId }),
    { keepPreviousData: true }
  );

  if (isLoading) {
    return (
      <div className="transaction-list__status" aria-live="polite">
        Loading transactions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="transaction-list__status transaction-list__status--error" aria-live="polite">
        Error loading transactions: {error.message}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list__status" aria-live="polite">
        No transactions found.
      </div>
    );
  }

  return (
    <ul className="transaction-list">
      {transactions.map(tx => (
        <li key={tx.id} className="transaction-list__item">
          <div className="transaction-list__date">
            {format(new Date(tx.date), 'MMM d, yyyy')}
          </div>
          <div className="transaction-list__details">
            <span className="transaction-list__description">{tx.description}</span>
            <span className="transaction-list__category">{tx.category}</span>
          </div>
          <div
            className={`transaction-list__amount ${
              tx.amount < 0
                ? 'transaction-list__amount--expense'
                : 'transaction-list__amount--income'
            }`}
          >
            {tx.amount.toLocaleString(undefined, {
              style: 'currency',
              currency: tx.currency || 'USD',
            })}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TransactionList;