import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { rechargeService } from '../../../core/services/rechargePaymentService';
import { Card, SectionHeader, StatusBadge, Table } from '../../../shared/components/ui';
import Button from '../../../shared/components/ui/Button';
import { formatCurrency, getErrorMessage } from '../../../shared/utils/helpers';
import type { RechargeResponseDTO, Pageable } from '../../../shared/types';

const STATUSES = ['ALL', 'SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'];

const AdminRechargesPage: React.FC = () => {
  const [data, setData] = useState<RechargeResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    load(page);
  }, [page]);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const pageable: Pageable = { page: p, size: PAGE_SIZE };
      const r = await rechargeService.getAllRecharges(pageable);
      setData(r.data?.content || []);
      setTotalPages(r.data?.totalPages || 1);
    } catch {
      toast.error('Failed to load recharges');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (recharge: RechargeResponseDTO, status: string) => {
    try {
      await rechargeService.updateRechargeStatus(recharge.rechargeId, status);
      toast.success(`Status updated to ${status}`);
      load(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = data.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        String(r.rechargeId).includes(s) ||
        String(r.userId).includes(s) ||
        String(r.planId).includes(s)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-0 flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100vh-9.5rem)]">
      <SectionHeader
        title="All Recharges"
        subtitle="Manage and monitor all platform recharges"
      />

      <Card padding={false} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-surface-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by recharge, user or plan ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 h-10 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  statusFilter === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-surface-600 border-surface-300 hover:border-surface-400',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <Table
            loading={loading}
            data={filtered}
            keyExtractor={(r) => r.rechargeId}
            emptyMessage="No recharges found."
            columns={[
              {
                key: 'rechargeId',
                label: 'Recharge ID',
                render: (r) => <span className="font-mono text-xs text-surface-500">#{r.rechargeId}</span>,
              },
              {
                key: 'userId',
                label: 'User',
                render: (r) => <span className="font-medium text-surface-700">User #{r.userId}</span>,
              },
              {
                key: 'planId',
                label: 'Plan',
                render: (r) => <span className="text-surface-600">Plan #{r.planId}</span>,
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (r) => <span className="font-semibold text-surface-900">{formatCurrency(r.amount)}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => <StatusBadge status={r.status} />,
              },
              {
                key: 'actions',
                label: 'Update Status',
                render: (r) => (
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r, e.target.value)}
                    className="text-xs rounded-lg border border-surface-300 px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer hover:border-surface-400 transition-colors"
                  >
                    {['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ),
              },
            ]}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon="chevron_left"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              />
              <Button
                size="sm"
                variant="secondary"
                icon="chevron_right"
                iconPosition="right"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminRechargesPage;
