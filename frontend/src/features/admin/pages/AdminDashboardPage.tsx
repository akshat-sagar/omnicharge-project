import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAppSelector } from '../../../store/hooks';
import { userService } from '../../../core/services/userService';
import { operatorService, planService, normalizeCollection } from '../../../core/services/operatorPlanService';
import { rechargeService } from '../../../core/services/rechargePaymentService';
import { useAppTheme } from '../../../core/providers/AppThemeProvider';
import { Card, EmptyState, Spinner, StatCard, StatusBadge } from '../../../shared/components/ui';
import { formatCurrency } from '../../../shared/utils/helpers';
import type {
  OperatorResponseDTO,
  PageRechargeResponseDTO,
  PlanResponseDTO,
  RechargeResponseDTO,
  UserResponseDTO,
  Pageable,
} from '../../../shared/types';

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const CHART_COLORS = ['#16a34a', '#22c55e', '#f59e0b', '#ef4444', '#64748b'];

const STATUS_META: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: 'Success', color: '#22c55e' },
  PENDING: { label: 'Pending', color: '#f59e0b' },
  FAILED: { label: 'Failed', color: '#ef4444' },
  CANCELLED: { label: 'Cancelled', color: '#64748b' },
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
};

const AdminDashboardPage: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [operators, setOperators] = useState<OperatorResponseDTO[]>([]);
  const [plans, setPlans] = useState<PlanResponseDTO[]>([]);
  const [recentRecharges, setRecentRecharges] = useState<RechargeResponseDTO[]>([]);
  const [chartRecharges, setChartRecharges] = useState<RechargeResponseDTO[]>([]);
  const [totalRecharges, setTotalRecharges] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const recentPageable: Pageable = { page: 0, size: 5 };
      const chartPageable: Pageable = { page: 0, size: 24 };

      const [usersRes, operatorsRes, plansRes, recentRes, chartRes] = await Promise.allSettled([
        userService.getAllUsers(),
        operatorService.getAllOperators(),
        planService.getAllPlans(),
        rechargeService.getAllRecharges(recentPageable),
        rechargeService.getAllRecharges(chartPageable),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : []);
      }

      if (operatorsRes.status === 'fulfilled') {
        setOperators(normalizeCollection<OperatorResponseDTO>(operatorsRes.value.data));
      }

      if (plansRes.status === 'fulfilled') {
        setPlans(normalizeCollection<PlanResponseDTO>(plansRes.value.data));
      }

      if (recentRes.status === 'fulfilled') {
        const payload = recentRes.value.data as PageRechargeResponseDTO;
        setRecentRecharges(payload?.content || []);
        setTotalRecharges(payload?.totalElements || 0);
      }

      if (chartRes.status === 'fulfilled') {
        const payload = chartRes.value.data as PageRechargeResponseDTO;
        setChartRecharges(payload?.content || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const adminCount = users.filter((entry) => entry.role === 'ADMIN').length;
  const pendingRecharges = chartRecharges.filter((entry) => entry.status === 'PENDING').length;
  const totalRechargeValue = chartRecharges.reduce((sum, entry) => sum + entry.amount, 0);
  const userCount = users.filter((entry) => entry.role === 'USER').length;

  const statusBreakdown = Object.entries(
    chartRecharges.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([status, count]) => ({
      status,
      count,
      color: STATUS_META[status]?.color || '#64748b',
      label: STATUS_META[status]?.label || status,
    }))
    .sort((a, b) => b.count - a.count);

  const totalStatusCount = statusBreakdown.reduce((sum, item) => sum + item.count, 0);
  let runningAngle = 0;
  const donutSegments = statusBreakdown.map((item) => {
    const sweep = totalStatusCount ? (item.count / totalStatusCount) * 360 : 0;
    const segment = {
      ...item,
      startAngle: runningAngle,
      endAngle: runningAngle + sweep,
    };
    runningAngle += sweep;
    return segment;
  });

  const trendData = [...chartRecharges].reverse().slice(-8);
  const maxTrendAmount = Math.max(...trendData.map((item) => item.amount), 1);

  const planFrequency = Object.entries(
    chartRecharges.reduce<Record<string, number>>((acc, entry) => {
      const key = `Plan #${entry.planId}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, count], index) => ({
      label,
      count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxPlanCount = Math.max(...planFrequency.map((item) => item.count), 1);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <motion.div
        variants={fadeUp}
        className={[
          'relative mb-7 overflow-hidden rounded-[28px] border px-4 py-5 sm:px-7 sm:py-6',
          isDark
            ? 'border-[#1f2b43] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(135deg,rgba(13,17,31,0.96),rgba(10,16,28,0.92))]'
            : 'border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,253,244,0.86))] shadow-[0_24px_60px_rgba(15,23,42,0.08)]',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(148,163,184,0.08) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">Admin Dashboard</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-surface-900 sm:text-4xl">
              Welcome, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-500 sm:text-base">
              Monitor users, plans, operators, and recharge activity from one place. Admin accounts use management tools instead of recharge flows.
            </p>
          </div>
          <div
            className={[
              'grid grid-cols-1 gap-3 rounded-2xl border p-3 backdrop-blur-xl min-[360px]:grid-cols-2',
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-white/70 bg-white/65',
            ].join(' ')}
          >
            <div className="rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-surface-500">Admins</p>
              <p className="mt-1 text-lg font-semibold text-surface-900">{loading ? '—' : adminCount}</p>
            </div>
            <div className="rounded-2xl px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-surface-500">Pending Recent</p>
              <p className="mt-1 text-lg font-semibold text-primary-500">{loading ? '—' : pendingRecharges}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-7 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={loading ? '—' : users.length} icon="group" iconColor="text-primary-600 bg-primary-50" />
        <StatCard label="Operators" value={loading ? '—' : operators.length} icon="cell_tower" iconColor="text-emerald-600 bg-emerald-50" />
        <StatCard label="Plans" value={loading ? '—' : plans.length} icon="list_alt" iconColor="text-amber-600 bg-amber-50" />
        <StatCard label="Total Recharges" value={loading ? '—' : totalRecharges} icon="manage_history" iconColor="text-fuchsia-600 bg-fuchsia-50" />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-7 grid gap-6 xl:grid-cols-[1.15fr_1fr_1fr]">
        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-surface-900">Recharge Status Mix</h2>
            <p className="mt-1 text-xs text-surface-500">Distribution from the latest platform recharge batch</p>
          </div>
          {loading ? (
            <Spinner className="py-12" />
          ) : totalStatusCount === 0 ? (
            <EmptyState icon="donut_small" title="No chart data yet" description="Recharge status distribution will appear here." />
          ) : (
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="mx-auto flex w-full max-w-[220px] justify-center">
                <svg viewBox="0 0 180 180" className="h-48 w-48">
                  <circle cx="90" cy="90" r="54" fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'} strokeWidth="18" />
                  {donutSegments.map((segment) => (
                    <path
                      key={segment.status}
                      d={describeArc(90, 90, 54, segment.startAngle, segment.endAngle || segment.startAngle + 0.01)}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="18"
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200 hover:opacity-100"
                      style={{ filter: `drop-shadow(0 0 12px ${segment.color}55)` }}
                    />
                  ))}
                  <text x="90" y="84" textAnchor="middle" className="fill-slate-400 text-[12px] font-medium">
                    Total
                  </text>
                  <text x="90" y="106" textAnchor="middle" className="fill-slate-900 text-[22px] font-semibold dark:fill-slate-100">
                    {totalStatusCount}
                  </text>
                </svg>
              </div>
              <div className="space-y-3">
                {statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className={['text-sm', isDark ? 'text-surface-300' : 'text-surface-600'].join(' ')}>{item.label}</span>
                    </div>
                    <span className={['text-sm font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-surface-900">Recharge Value Trend</h2>
            <p className="mt-1 text-xs text-surface-500">Latest recharge amounts in sequence</p>
          </div>
          {loading ? (
            <Spinner className="py-12" />
          ) : trendData.length === 0 ? (
            <EmptyState icon="show_chart" title="No trend data yet" description="Recharge values will appear here when platform activity begins." />
          ) : (
            <>
              <div className="flex h-52 items-end gap-3">
                {trendData.map((item, index) => (
                  <div key={`${item.rechargeId}-${index}`} className="group flex flex-1 cursor-pointer flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#4ade80_0%,#16a34a_100%)] shadow-[0_10px_25px_rgba(22,163,74,0.24)] transition-all duration-200 group-hover:brightness-110 group-hover:shadow-[0_0_28px_rgba(34,197,94,0.65)]"
                      style={{ height: `${Math.max((item.amount / maxTrendAmount) * 160, 18)}px` }}
                    />
                    <span className={['text-[11px] transition-colors duration-200', isDark ? 'text-surface-400 group-hover:text-surface-200' : 'text-surface-500 group-hover:text-surface-700'].join(' ')}>#{item.rechargeId}</span>
                  </div>
                ))}
              </div>
              <div
                className={[
                  'mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 text-sm',
                  isDark
                    ? 'border-white/10 bg-white/[0.06]'
                    : 'border-surface-200/70 bg-white/40',
                ].join(' ')}
              >
                <span className={isDark ? 'text-surface-300' : 'text-surface-500'}>Visible value</span>
                <span className={['font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{formatCurrency(totalRechargeValue)}</span>
              </div>
            </>
          )}
        </Card>

        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-surface-900">User Role Split</h2>
            <p className="mt-1 text-xs text-surface-500">Quick view of admin vs user accounts</p>
          </div>
          {loading ? (
            <Spinner className="py-12" />
          ) : (
            <div className="space-y-5">
              {[
                { label: 'Users', count: userCount, color: '#16a34a' },
                { label: 'Admins', count: adminCount, color: '#10b981' },
              ].map((item) => {
                const total = Math.max(users.length, 1);
                const width = (item.count / total) * 100;
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={['text-sm', isDark ? 'text-surface-300' : 'text-surface-600'].join(' ')}>{item.label}</span>
                      <span className={['text-sm font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{item.count}</span>
                    </div>
                    <div className={['h-3 overflow-hidden rounded-full', isDark ? 'bg-white/10' : 'bg-surface-200/70'].join(' ')}>
                      <div
                        className="h-full rounded-full transition-all duration-200 hover:brightness-110"
                        style={{ width: `${width}%`, backgroundColor: item.color, boxShadow: `0 0 16px ${item.color}66` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4 flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-surface-900">Recent Platform Recharges</h2>
              <p className="mt-1 text-xs text-surface-500">Latest recharge activity across the platform</p>
            </div>
            <Link to="/admin/recharges" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
              View all
              <span className="material-icon text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <Spinner className="py-12" />
          ) : recentRecharges.length === 0 ? (
            <EmptyState icon="manage_history" title="No recharge data yet" description="Platform recharge activity will appear here." />
          ) : (
            <div className="space-y-2">
              {recentRecharges.map((entry) => (
                <div
                  key={entry.rechargeId}
                  className={[
                    'flex flex-col gap-3 rounded-2xl px-3 py-3 transition-colors min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between',
                    isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-surface-50/80',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className={['hidden w-9 h-9 rounded-xl items-center justify-center flex-shrink-0 min-[360px]:flex', isDark ? 'bg-primary-500/12' : 'bg-primary-50'].join(' ')}>
                      <span className="material-icon text-primary-600 text-[18px]">manage_history</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">Recharge #{entry.rechargeId}</p>
                      <p className="text-xs text-surface-500">Plan #{entry.planId} · User #{entry.userId}</p>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 min-[360px]:w-auto min-[360px]:flex min-[360px]:flex-col min-[360px]:items-end">
                    <span className="text-sm font-semibold text-surface-900">{formatCurrency(entry.amount)}</span>
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-6">
        <Card className={isDark ? 'bg-white/[0.03]' : 'bg-white/78'}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-surface-900">Top Active Plans</h2>
            <p className="mt-1 text-xs text-surface-500">Most frequently seen plans in the latest recharge batch</p>
          </div>
          {loading ? (
            <Spinner className="py-12" />
          ) : planFrequency.length === 0 ? (
            <EmptyState icon="bar_chart" title="No plan activity yet" description="Top plans will appear once recharge activity is available." />
          ) : (
            <div className="space-y-4">
              {planFrequency.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={['text-sm', isDark ? 'text-surface-300' : 'text-surface-600'].join(' ')}>{item.label}</span>
                    <span className={['text-sm font-semibold', isDark ? 'text-surface-50' : 'text-surface-900'].join(' ')}>{item.count}</span>
                  </div>
                  <div className={['h-3 overflow-hidden rounded-full', isDark ? 'bg-white/10' : 'bg-surface-200/70'].join(' ')}>
                    <div
                      className="h-full rounded-full transition-all duration-200 hover:brightness-110"
                      style={{
                        width: `${(item.count / maxPlanCount) * 100}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 16px ${item.color}66`,
                      }}
                    />
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

export default AdminDashboardPage;
