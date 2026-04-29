import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { planService, operatorService } from '../../services/operatorPlanService';
import { Card, SectionHeader, Modal, ConfirmDialog, Table, Badge } from '../ui/index';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Select } from '../ui/index';
import { planSchema, type PlanFormData } from '../../utils/validationSchemas';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import type { PlanResponseDTO, OperatorResponseDTO } from '../../types';

const PAGE_SIZE = 10;

const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanResponseDTO[]>([]);
  const [operators, setOperators] = useState<OperatorResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanResponseDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterOp, setFilterOp] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    load();
    operatorService.getAllOperators().then((r) => setOperators(r.data || []));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await planService.getAllPlans();
      setPlans(r.data || []);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ amount: undefined as unknown as number, validity: '', description: '', operatorId: undefined });
    setModalOpen(true);
  };

  const openEdit = (p: PlanResponseDTO) => {
    setEditing(p);
    reset({ amount: p.amount, validity: p.validity, description: p.description, operatorId: p.operatorId });
    setModalOpen(true);
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (editing) {
        await planService.updatePlan(editing.id, data);
        toast.success('Plan updated');
      } else {
        await planService.createPlan(data);
        toast.success('Plan created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await planService.deletePlan(deleteId);
      toast.success('Plan deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const opMap = Object.fromEntries(operators.map((o) => [o.id, o.name]));

  const filtered = plans.filter((p) => {
    if (filterOp && String(p.operatorId) !== filterOp) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return p.description.toLowerCase().includes(s) || String(p.amount).includes(s) || p.validity.toLowerCase().includes(s);
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedPlans = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search, filterOp, plans]);

  return (
    <div className="flex min-h-0 flex-col h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100vh-9.5rem)]">
      <SectionHeader
        title="Plans"
        subtitle={`${plans.length} plans configured`}
        action={<Button icon="add" size="sm" onClick={openCreate}>Add Plan</Button>}
      />

      <Card padding={false} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="p-5 border-b border-surface-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 h-10 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-colors"
            />
          </div>
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            className="h-10 px-3 rounded-lg border border-surface-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px]"
          >
            <option value="">All Operators</option>
            {operators.map((o) => (
              <option key={o.id} value={String(o.id)}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <Table
            loading={loading}
            data={paginatedPlans}
            keyExtractor={(p) => p.id}
            emptyMessage="No plans found."
            columns={[
              {
                key: 'id',
                label: 'ID',
                render: (p) => <span className="font-mono text-xs text-surface-500">#{p.id}</span>,
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (p) => <span className="font-semibold text-surface-900">{formatCurrency(p.amount)}</span>,
              },
              {
                key: 'validity',
                label: 'Validity',
                render: (p) => (
                  <div className="flex items-center gap-1 text-surface-600">
                    <span className="material-icon text-[14px] text-surface-400">schedule</span>
                    {p.validity}
                  </div>
                ),
              },
              {
                key: 'description',
                label: 'Description',
                render: (p) => <span className="text-surface-600 max-w-xs truncate block">{p.description}</span>,
              },
              {
                key: 'operator',
                label: 'Operator',
                render: (p) => (
                  <Badge variant="neutral">{opMap[p.operatorId || 0] || `#${p.operatorId}`}</Badge>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (p) => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" icon="edit" onClick={() => openEdit(p)}>Edit</Button>
                    <Button size="sm" variant="ghost" icon="delete" onClick={() => setDeleteId(p.id)}
                      className="text-red-500 hover:bg-red-50" />
                  </div>
                ),
              },
            ]}
          />
        </div>

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
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Plan' : 'Add Plan'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            icon="currency_rupee"
            placeholder="199"
            required
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Input
            label="Validity"
            icon="schedule"
            placeholder="28 days"
            required
            error={errors.validity?.message}
            {...register('validity')}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Unlimited calls, 2GB/day, 100 SMS"
              className={[
                'w-full rounded-lg border border-surface-300 text-surface-900 text-sm p-3',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'hover:border-surface-400 resize-none transition-colors',
                errors.description ? 'border-red-400 bg-red-50' : '',
              ].join(' ')}
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <span className="material-icon text-[14px]">error</span>
                {errors.description.message}
              </p>
            )}
          </div>
          <Select
            label="Operator"
            options={operators.map((o) => ({ value: o.id, label: o.name }))}
            placeholder="Select operator"
            {...register('operatorId', { valueAsNumber: true })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This cannot be undone."
      />
    </div>
  );
};

export default AdminPlansPage;
