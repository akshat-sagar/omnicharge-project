import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { rechargeService } from '../../services/rechargePaymentService';
import { paymentService } from '../../services/rechargePaymentService';
import { StatCard, Card, StatusBadge, EmptyState } from '../ui/index';
import { formatCurrency } from '../../utils/helpers';
import type { RechargeResponseDTO, TransactionResponseDTO } from '../../types';
import Button from '../ui/Button';
import { useAppTheme } from '../../theme/AppThemeProvider';

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { isDark } = useAppTheme();
  const [recharges, setRecharges] = useState<RechargeResponseDTO[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, tRes] = await Promise.allSettled([
          rechargeService.getMyRecharges(),
          paymentService.getMyTransactions(),
        ]);
        if (rRes.status === 'fulfilled') setRecharges(rRes.value.data || []);
        if (tRes.status === 'fulfilled') setTransactions(tRes.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const successCount = recharges.filter((r) => r.status === 'SUCCESS').length;
  const totalSpent = transactions
    .filter((t) => t.transactionStatus === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  const recent = [...recharges]
    .sort((a, b) => (b.rechargeId ?? 0) - (a.rechargeId ?? 0))
    .slice(0, 5);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className={[
          'relative mb-7 overflow-hidden rounded-[28px] border px-4 py-5 sm:px-7 sm:py-6',
          isDark
            ? 'border-[#1f2b43] bg-[radial-gradient(circle_at_top_left,rgba(74,121,255,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,201,137,0.08),transparent_22%),linear-gradient(135deg,rgba(13,17,31,0.94),rgba(10,16,28,0.9))]'
            : 'border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,244,255,0.86))] shadow-[0_24px_60px_rgba(15,23,42,0.08)]',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(148,163,184,0.08) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }} />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">Dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-surface-900 sm:text-4xl">
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-500 sm:text-base">
              Here&apos;s a clean overview of your recharge activity, recent progress, and the actions you use most.
            </p>
          </div>
          <div
            className={[
              'grid grid-cols-1 gap-3 rounded-2xl border p-3 backdrop-blur-xl min-[360px]:grid-cols-2',
              isDark
                ? 'border-white/10 bg-white/[0.04]'
                : 'border-white/70 bg-white/65',
            ].join(' ')}
          >
            <div className="rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-surface-500">Success Rate</p>
              <p className="mt-1 text-lg font-semibold text-surface-900">
                {recharges.length ? `${Math.round((successCount / recharges.length) * 100)}%` : '—'}
              </p>
            </div>
            <div className="rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-surface-500">Spent</p>
              <p className="mt-1 text-lg font-semibold text-primary-500">{loading ? '—' : formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="mb-7 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Recharges"
          value={loading ? '—' : recharges.length}
          icon="phone_iphone"
          iconColor="text-primary-600 bg-primary-50"
        />
        <StatCard
          label="Successful"
          value={loading ? '—' : successCount}
          icon="check_circle"
          iconColor="text-green-600 bg-green-50"
        />
        <StatCard
          label="Total Spent"
          value={loading ? '—' : formatCurrency(totalSpent)}
          icon="currency_rupee"
          iconColor="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Transactions"
          value={loading ? '—' : transactions.length}
          icon="receipt_long"
          iconColor="text-purple-600 bg-purple-50"
        />
      </motion.div>


      {/* Recent Recharges */}
      <motion.div variants={fadeUp}>
        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4 flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
            <h2 className="text-sm font-semibold text-surface-900">Recent Recharges</h2>
            <Link to="/app/my-recharges" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
              View all
              <span className="material-icon text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-surface-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              icon="phone_iphone"
              title="No recharges yet"
              description="Start your first recharge to see activity here."
              action={
                <Link to="/app/recharge">
                  <Button icon="add" size="sm">New Recharge</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div
                  key={r.rechargeId}
                  className={[
                    'flex flex-col gap-3 rounded-2xl px-3 py-3 transition-colors min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between',
                    isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-surface-50/80',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className={[
                      'hidden w-9 h-9 rounded-xl items-center justify-center flex-shrink-0 min-[360px]:flex',
                      isDark ? 'bg-primary-500/12' : 'bg-primary-50',
                    ].join(' ')}>
                      <span className="material-icon text-primary-600 text-[18px]">phone_iphone</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">Recharge #{r.rechargeId}</p>
                      <p className="text-xs text-surface-500">Plan #{r.planId}</p>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 min-[360px]:w-auto min-[360px]:flex min-[360px]:flex-col min-[360px]:items-end">
                    <span className="text-sm font-semibold text-surface-900">{formatCurrency(r.amount)}</span>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
