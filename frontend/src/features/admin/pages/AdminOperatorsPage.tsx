import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { operatorService } from '../../../core/services/operatorPlanService';
import { Card, SectionHeader, Modal, ConfirmDialog, Table } from '../../../shared/components/ui';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { operatorSchema, type OperatorFormData } from '../../../shared/utils/validationSchemas';
import { getErrorMessage } from '../../../shared/utils/helpers';
import type { OperatorResponseDTO } from '../../../shared/types';

const AdminOperatorsPage: React.FC = () => {
  const [operators, setOperators] = useState<OperatorResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OperatorResponseDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    mode: 'onTouched',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await operatorService.getAllOperators();
      setOperators(r.data || []);
    } catch {
      toast.error('Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); reset({ name: '' }); setModalOpen(true); };
  const openEdit = (op: OperatorResponseDTO) => { setEditing(op); reset({ name: op.name }); setModalOpen(true); };

  const onSubmit = async (data: OperatorFormData) => {
    try {
      if (editing) {
        await operatorService.updateOperator(editing.id, data);
        toast.success('Operator updated');
      } else {
        await operatorService.createOperator(data);
        toast.success('Operator created');
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
      await operatorService.deleteOperator(deleteId);
      toast.success('Operator deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Operators"
        subtitle={`${operators.length} operators configured`}
        action={
          <Button icon="add" size="sm" onClick={openCreate}>Add Operator</Button>
        }
      />

      <Card padding={false}>
        <Table
          loading={loading}
          data={operators}
          keyExtractor={(o) => o.id}
          emptyMessage="No operators yet. Add your first operator."
          columns={[
            {
              key: 'id',
              label: 'ID',
              render: (o) => <span className="font-mono text-xs text-surface-500">#{o.id}</span>,
            },
            {
              key: 'name',
              label: 'Operator Name',
              render: (o) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center">
                    <span className="material-icon text-surface-500 text-[16px]">cell_tower</span>
                  </div>
                  <span className="font-medium text-surface-900">{o.name}</span>
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (o) => (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" icon="edit" onClick={() => openEdit(o)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    onClick={() => setDeleteId(o.id)}
                    className="text-red-500 hover:bg-red-50"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Operator' : 'Add Operator'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Operator name"
            icon="business"
            placeholder="e.g. Jio, Airtel, Vi"
            required
            error={errors.name?.message}
            {...register('name')}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Operator"
        description="Deleting this operator will also affect associated plans. This action cannot be undone."
      />
    </div>
  );
};

export default AdminOperatorsPage;
