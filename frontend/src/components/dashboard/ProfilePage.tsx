import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { Card, SectionHeader, Badge, ConfirmDialog } from '../ui/index';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { profileSchema, type ProfileFormData } from '../../utils/validationSchemas';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../utils/helpers';
import { useAppTheme } from '../../theme/AppThemeProvider';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { isDark } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
      });
    }
  }, [user, reset]);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        contactNo: user.contactNo || '',
      });
    }
    setPendingData(null);
    setConfirmOpen(false);
    setIsEditing(false);
  };

  const onSubmit = (data: ProfileFormData) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;

    try {
      const res = await userService.updateProfile({
        name: pendingData.name,
        email: pendingData.email,
        contactNo: pendingData.contactNo || undefined,
      });
      dispatch(setUser(res.data));
      reset({
        name: res.data.name || '',
        email: res.data.email || '',
        contactNo: res.data.contactNo || '',
      });
      setConfirmOpen(false);
      setPendingData(null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <SectionHeader title="Profile" subtitle="Manage your account information" />

      <div className="w-full space-y-12">
        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className={[
              'overflow-hidden border-surface-200/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)]',
              isDark
                ? 'bg-[radial-gradient(circle_at_top_left,rgba(74,121,255,0.18),transparent_30%),linear-gradient(135deg,rgba(13,17,31,0.94),rgba(11,18,32,0.9))]'
                : 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.1),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,245,255,0.92))]',
            ].join(' ')}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div
                  className={[
                    'flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl shadow-inner',
                    isDark
                      ? 'bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-white/10 ring-1 ring-primary-400/20'
                      : 'bg-gradient-to-br from-primary-100 via-blue-50 to-white ring-1 ring-primary-100',
                  ].join(' ')}
                >
                  <span className="text-3xl font-semibold text-primary-700">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Account</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-surface-900 break-words">
                    {user?.name}
                  </p>
                  <p className="mt-1 text-sm text-surface-500 break-all">{user?.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={user?.role === 'ADMIN' ? 'primary' : 'neutral'} size="md">
                      {user?.role}
                    </Badge>
                    {user?.contactNo && (
                      <span
                        className={[
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                          isDark
                            ? 'border-white/10 bg-white/5 text-surface-500'
                            : 'border-surface-200 bg-white/90 text-surface-600',
                        ].join(' ')}
                      >
                        <span className="material-icon text-[14px]">phone</span>
                        {user.contactNo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card
            className={[
              'border-surface-200/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)]',
              isDark ? 'bg-white/[0.03]' : 'bg-white/95',
            ].join(' ')}
          >
            <div
              className={[
                'mb-6 rounded-2xl border p-5',
                isDark ? 'border-white/10 bg-white/[0.03]' : 'border-surface-200 bg-surface-50/70',
              ].join(' ')}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Profile Details</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-surface-900">Edit Profile</h2>
                  <p className="mt-2 text-sm leading-6 text-surface-500">
                    Keep your account details up to date. Your information stays locked until you choose to edit it.
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    icon="edit"
                    onClick={handleEditStart}
                    className="h-11 min-w-[170px] rounded-xl px-5"
                  >
                    Edit profile
                  </Button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div
                  className={[
                    'rounded-2xl border p-4',
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-surface-200 bg-surface-50/60',
                  ].join(' ')}
                >
                  <Input
                    label="Full name"
                    icon="person"
                    required
                    error={errors.name?.message}
                    disabled={!isEditing}
                    className="bg-white/80"
                    {...register('name')}
                  />
                </div>
                <div
                  className={[
                    'rounded-2xl border p-4',
                    isDark ? 'border-white/10 bg-white/[0.03]' : 'border-surface-200 bg-surface-50/60',
                  ].join(' ')}
                >
                  <Input
                    label="Email address"
                    type="email"
                    icon="mail"
                    required
                    error={errors.email?.message}
                    disabled={!isEditing}
                    className="bg-white/80"
                    {...register('email')}
                  />
                </div>
              </div>

              <div
                className={[
                  'rounded-2xl border p-4',
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-surface-200 bg-surface-50/60',
                ].join(' ')}
              >
                <Input
                  label="Mobile number"
                  type="tel"
                  icon="phone"
                  placeholder="9876543210"
                  error={errors.contactNo?.message}
                  disabled={!isEditing}
                  className="bg-white/80"
                  {...register('contactNo')}
                />
              </div>

              {isEditing && (
                <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Ready to save your changes?</p>
                    <p className="mt-1 text-sm text-surface-500">
                      We’ll ask for one confirmation before updating your profile.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleEditCancel}
                      disabled={isSubmitting}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={!isDirty}
                      icon="save"
                      className="rounded-xl"
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card
          className={[
            'border-surface-200/80 shadow-[0_18px_45px_rgba(15,23,42,0.08)]',
            isDark ? 'bg-white/[0.03]' : 'bg-white/95',
          ].join(' ')}
        >
          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">Appearance</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-surface-900">Theme</h2>
              </div>
              <ThemeToggle />
            </div>
            <p className="mt-3 text-sm leading-6 text-surface-500">
              Toggle the app theme to keep the interface comfortable and easy to read.
            </p>
          </div>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!isSubmitting) setConfirmOpen(false);
        }}
        onConfirm={handleConfirmSave}
        title="Confirm profile changes"
        description="Are you sure you want to save these profile changes?"
        loading={isSubmitting}
        confirmLabel="Yes, save"
        variant="primary"
      />
    </div>
  );
};

export default ProfilePage;
