import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import AuthLayout from '../../../layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import { loginSchema, type LoginFormData } from '../../../shared/utils/validationSchemas';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUser, fetchProfile } from '../../../store/slices/authSlice';
import { getErrorMessage } from '../../../shared/utils/helpers';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      if (result?.accessToken) {
        let resolvedUser = result.user;
        if (!result.user) {
          resolvedUser = await dispatch(fetchProfile()).unwrap();
        }
        toast.success('Welcome back!');
        navigate(resolvedUser?.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
        return;
      }
      toast.error('Login failed. Check your credentials.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Enter your credentials to continue">
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

        <Input
          label="Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isLoading} size="md" className="mt-1">
          Sign in
        </Button>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-surface-500 mt-5"
      >
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create account
        </Link>
      </motion.p>

      <div className="mt-3 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-surface-500 transition hover:text-primary-600"
        >
          <span className="material-icon text-[16px]">home</span>
          Back to home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
