import type { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred';
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  if (axiosError.response?.data?.message) return axiosError.response.data.message;
  if (axiosError.response?.data?.error) return axiosError.response.data.error;
  if (axiosError.message) return axiosError.message;
  return 'An unexpected error occurred';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const getStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'text-green-700 bg-green-50 border-green-200';
    case 'FAILED': return 'text-red-700 bg-red-50 border-red-200';
    case 'PENDING': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'CANCELLED': return 'text-slate-600 bg-slate-50 border-slate-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS': return 'check_circle';
    case 'FAILED': return 'cancel';
    case 'PENDING': return 'schedule';
    case 'CANCELLED': return 'remove_circle';
    default: return 'help';
  }
};

export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
