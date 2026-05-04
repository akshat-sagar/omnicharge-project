import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AuthLayout from '../../../layouts/AuthLayout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import { registerSchema, type RegisterFormData } from '../../../shared/utils/validationSchemas';
import { userService } from '../../../core/services/userService';
import { getErrorMessage } from '../../../shared/utils/helpers';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await userService.register({
        name: data.name,
        email: data.email,
        contactNo: data.contactNo || undefined,
        password: data.password,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join OmniCharge to manage your recharges">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Full name"
          icon="person"
          placeholder="Rahul Sharma"
          required
          error={errors.name?.message}
          {...register('name')}
        />

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
          label="Mobile number"
          type="tel"
          icon="phone"
          placeholder="9876543210"
          error={errors.contactNo?.message}
          helperText="10-digit Indian mobile number (optional)"
          {...register('contactNo')}
        />

        <Input
          label="Password"
          type="password"
          icon="lock"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          helperText="8–20 chars with uppercase, lowercase, number & special char"
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          icon="lock_reset"
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isSubmitting} size="md" className="mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>

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

export default RegisterPage;
