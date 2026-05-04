import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthLayout from '../../../layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from '../../../shared/utils/validationSchemas';
import { authService } from '../../../core/services/authService';
import { getErrorMessage } from '../../../shared/utils/helpers';

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent an OTP to reset your password">
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
            <span className="material-icon text-green-600 text-[28px]">mark_email_read</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-surface-600">
              We sent an OTP to <strong className="text-surface-900">{getValues('email')}</strong>
            </p>
            <p className="text-sm text-surface-500 mt-1">
              Use it on the reset password page.
            </p>
          </div>
          <Link
            to="/reset-password"
            state={{ email: getValues('email') }}
            className="w-full"
          >
            <Button fullWidth>Continue to reset password</Button>
          </Link>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Resend OTP
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you an OTP"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          icon="mail"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Send OTP
        </Button>
      </form>
      <p className="text-center text-sm text-surface-500 mt-5">
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const [email, setEmail] = React.useState(
    (location.state as { email?: string } | null)?.email || ''
  );

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter the OTP sent to your email">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          icon="mail"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="OTP"
          icon="pin"
          placeholder="Enter OTP"
          required
          error={errors.otp?.message}
          {...register('otp')}
        />
        <Input
          label="New password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          required
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm new password"
          type="password"
          icon="lock_reset"
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Reset password
        </Button>
      </form>
      <p className="text-center text-sm text-surface-500 mt-5">
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
