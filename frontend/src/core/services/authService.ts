import api from '../api/client';
import type { LoginRequestDTO, VerifyOtpRequestDTO, ResetPasswordRequestDTO, RefreshTokenRequestDTO } from '../../shared/types';

export const authService = {
  login: (data: LoginRequestDTO) =>
    api.post('/auth/login', data),

  sendOtp: (email: string) =>
    api.post('/auth/send-otp', { email }),

  verifyOtp: (data: VerifyOtpRequestDTO) =>
    api.post('/auth/verify-otp', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: ResetPasswordRequestDTO) =>
    api.post('/auth/reset-password', data),

  refreshToken: (data: RefreshTokenRequestDTO) =>
    api.post('/auth/refresh-token', data),
};
