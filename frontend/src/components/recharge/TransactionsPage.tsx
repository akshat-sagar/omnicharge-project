import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { paymentService } from '../../services/rechargePaymentService';
import { Card, SectionHeader, StatusBadge, EmptyState, Spinner } from '../ui/index';
import Button from '../ui/Button';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAppTheme } from '../../theme/AppThemeProvider';
import type { TransactionResponseDTO } from '../../types';

const PAGE_SIZE = 10;

const TransactionsPage: React.FC = () => {
  const { isDark } = useAppTheme();
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    paymentService.getMyTransactions()
      .then((r) => {
        const sorted = [...(r.data || [])].sort((a, b) => {
          const timeDiff = new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime();
          if (timeDiff !== 0) return timeDiff;
          return (b.rechargeId ?? 0) - (a.rechargeId ?? 0);
        });
        setTransactions(sorted);
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      String(t.rechargeId).includes(s) ||
      t.transactionStatus.toLowerCase().includes(s) ||
      t.paymentMethod.toLowerCase().includes(s)
    );
  });

  useEffect(() => {
    setPage(0);
  }, [search, transactions]);

  const paymentIcons: Record<string, string> = {
    UPI: 'qr_code',
    CARD: 'credit_card',
    NETBANKING: 'account_balance',
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedTransactions = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex min-h-0 flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100vh-9.5rem)]">
      <SectionHeader title="My Transactions" subtitle="Your complete payment history" />

      <Card className={['flex min-h-0 flex-1 flex-col overflow-hidden', isDark ? 'bg-white/[0.03] border-white/10' : ''].join(' ')} padding={false}>
        <div className={['p-5', isDark ? 'border-b border-white/10' : 'border-b border-surface-100/80'].join(' ')}>
          <div className="relative">
            <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by recharge ID, status or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={[
                'w-full pl-9 pr-3.5 py-2 h-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
                isDark
                  ? 'border border-white/10 bg-white/[0.05] text-surface-100 placeholder:text-surface-500 hover:border-white/20'
                  : 'border border-surface-300 hover:border-surface-400',
              ].join(' ')}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-5">
          {loading ? (
            <Spinner className="py-12" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No transactions found"
              description="Your transaction history will appear here after you recharge."
            />
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {paginatedTransactions.map((t, i) => (
                  <div
                    key={`${t.rechargeId}-${t.timestamp ?? i}`}
                    className={[
                      'flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between',
                      isDark
                        ? 'border border-white/10 bg-white/[0.05] shadow-[0_10px_28px_rgba(2,6,23,0.28)] hover:border-primary-400/30 hover:bg-primary-500/[0.08] hover:shadow-[0_18px_42px_rgba(15,23,42,0.32)]'
                        : 'border border-surface-200/70 bg-white/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] hover:border-primary-200/80 hover:bg-primary-50/40 hover:shadow-[0_18px_42px_rgba(59,130,246,0.12)]',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isDark ? 'bg-slate-900/90' : 'bg-surface-100'].join(' ')}>
                        <span className={['material-icon text-[20px]', isDark ? 'text-slate-300' : 'text-surface-600'].join(' ')}>
                          {paymentIcons[t.paymentMethod] || 'payment'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className={['text-sm font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>
                          Recharge #{t.rechargeId}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={['text-xs', isDark ? 'text-surface-400' : 'text-surface-500'].join(' ')}>{t.paymentMethod}</span>
                          {t.timestamp && (
                            <>
                              <span className={isDark ? 'text-slate-600' : 'text-surface-300'}>·</span>
                              <span className={['text-xs', isDark ? 'text-surface-400' : 'text-surface-500'].join(' ')}>{formatDate(t.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 sm:ml-4 sm:w-auto sm:flex-shrink-0 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5">
                      <span className={['text-sm font-bold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{formatCurrency(t.amount)}</span>
                      <StatusBadge status={t.transactionStatus} />
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={['mt-5 flex items-center justify-between pt-4', isDark ? 'border-t border-white/10' : 'border-t border-surface-100/80'].join(' ')}>
                  <p className={['text-sm', isDark ? 'text-surface-400' : 'text-surface-500'].join(' ')}>
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon="chevron_left"
                      disabled={page === 0}
                      onClick={() => setPage((current) => current - 1)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      icon="chevron_right"
                      iconPosition="right"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((current) => current + 1)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TransactionsPage;
