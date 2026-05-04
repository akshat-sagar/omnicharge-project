import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { rechargeService } from '../../../core/services/rechargePaymentService';
import { Card, SectionHeader, StatusBadge, EmptyState, Spinner } from '../../../shared/components/ui';
import Button from '../../../shared/components/ui/Button';
import { formatCurrency } from '../../../shared/utils/helpers';
import { useAppTheme } from '../../../core/providers/AppThemeProvider';
import type { RechargeResponseDTO } from '../../../shared/types';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

const MyRechargesPage: React.FC = () => {
  const { isDark } = useAppTheme();
  const [recharges, setRecharges] = useState<RechargeResponseDTO[]>([]);
  const [filtered, setFiltered] = useState<RechargeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  useEffect(() => {
    rechargeService.getMyRecharges()
      .then((r) => {
        const sorted = [...(r.data || [])].sort((a, b) => (b.rechargeId ?? 0) - (a.rechargeId ?? 0));
        setRecharges(sorted);
        setFiltered(sorted);
      })
      .catch(() => toast.error('Failed to load recharges'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...recharges];
    if (statusFilter !== 'ALL') data = data.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          String(r.rechargeId).includes(s) ||
          String(r.planId).includes(s) ||
          String(r.amount).includes(s)
      );
    }
    setFiltered(data);
  }, [search, statusFilter, recharges]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, recharges]);

  const statuses = ['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedRecharges = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex min-h-0 flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100vh-9.5rem)]">
      <SectionHeader
        title="My Recharges"
        subtitle="Track all your recharge history"
        action={
          <Link to="/app/recharge">
            <Button icon="add" size="sm">New Recharge</Button>
          </Link>
        }
      />

      <Card className={['flex min-h-0 flex-1 flex-col overflow-hidden', isDark ? 'bg-white/[0.03] border-white/10' : ''].join(' ')} padding={false}>
        <div className={['p-5', isDark ? 'border-b border-white/10' : 'border-b border-surface-100/80'].join(' ')}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by ID, plan or amount..."
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
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={[
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    statusFilter === s
                      ? 'bg-primary-600 text-white border-primary-600'
                      : isDark
                      ? 'bg-white/[0.04] text-surface-300 border-white/10 hover:border-white/20'
                      : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-5">
          {loading ? (
            <Spinner className="py-12" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="phone_iphone"
              title="No recharges found"
              description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Your recharge history will appear here.'}
            />
          ) : (
            <>
              <motion.div
                className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {paginatedRecharges.map((r) => (
                  <motion.div
                    key={r.rechargeId}
                    variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                    className={[
                      'flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between',
                      isDark
                        ? 'border border-white/10 bg-white/[0.05] shadow-[0_10px_28px_rgba(2,6,23,0.28)] hover:border-primary-400/30 hover:bg-primary-500/[0.08] hover:shadow-[0_18px_42px_rgba(15,23,42,0.32)]'
                        : 'border border-surface-200/70 bg-white/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] hover:border-primary-200/80 hover:bg-primary-50/40 hover:shadow-[0_18px_42px_rgba(34,197,94,0.12)]',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', isDark ? 'bg-slate-900/90' : 'bg-primary-50'].join(' ')}>
                        <span className={['material-icon text-[20px]', isDark ? 'text-primary-300' : 'text-primary-600'].join(' ')}>phone_iphone</span>
                      </div>
                      <div className="min-w-0">
                        <p className={['text-sm font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>Recharge #{r.rechargeId}</p>
                        <p className={['mt-0.5 text-xs', isDark ? 'text-surface-400' : 'text-surface-500'].join(' ')}>
                          Plan #{r.planId} &middot; User #{r.userId}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-3 sm:ml-4 sm:w-auto sm:flex-shrink-0 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5">
                      <span className={['text-sm font-bold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{formatCurrency(r.amount)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

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

export default MyRechargesPage;
