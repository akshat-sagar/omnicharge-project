import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { userService } from '../../../core/services/userService';
import { Card, SectionHeader, Badge, ConfirmDialog, Table } from '../../../shared/components/ui';
import Button from '../../../shared/components/ui/Button';
import { getErrorMessage } from '../../../shared/utils/helpers';
import type { UserResponseDTO } from '../../../shared/types';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await userService.getAllUsers();
      setUsers(r.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (u: UserResponseDTO) => {
    try {
      const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
      await userService.updateRole(u.userId, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.contactNo || '').includes(s)
    );
  });

  return (
    <div>
      <SectionHeader
        title="Users"
        subtitle={`${users.length} registered users`}
      />

      <Card padding={false}>
        <div className="p-5 border-b border-surface-100">
          <div className="relative">
            <span className="material-icon absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 h-10 rounded-lg border border-surface-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-colors"
            />
          </div>
        </div>

        <Table
          loading={loading}
          data={filtered}
          keyExtractor={(u) => u.userId}
          emptyMessage="No users found"
          columns={[
            {
              key: 'name',
              label: 'User',
              render: (u) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 text-xs font-semibold">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">{u.name}</p>
                    <p className="text-xs text-surface-500">{u.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'contactNo',
              label: 'Mobile',
              render: (u) => <span className="font-mono text-xs">{u.contactNo || '—'}</span>,
            },
            {
              key: 'role',
              label: 'Role',
              render: (u) => (
                <Badge variant={u.role === 'ADMIN' ? 'primary' : 'neutral'}>{u.role}</Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (u) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={u.role === 'ADMIN' ? 'person' : 'admin_panel_settings'}
                    onClick={() => handleToggleRole(u)}
                  >
                    {u.role === 'ADMIN' ? 'Make User' : 'Make Admin'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="delete"
                    onClick={() => setDeleteId(u.userId)}
                    className="text-red-500 hover:bg-red-50"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminUsersPage;
