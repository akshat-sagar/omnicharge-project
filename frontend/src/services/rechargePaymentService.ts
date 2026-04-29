import api from './api';
import type { RechargeRequestDTO, Pageable, RazorpayOrderRequestDTO, PaymentVerifyRequestDTO } from '../types';

export const rechargeService = {
  addRecharge: (data: RechargeRequestDTO) =>
    api.post('/recharge/add-recharge', data),

  getAllRecharges: (pageable: Pageable) =>
    api.get('/recharge', { params: pageable }),

  getRechargeById: (id: number) =>
    api.get(`/recharge/${id}`),

  getRechargeByUserId: (userId: number) =>
    api.get(`/recharge/user/${userId}`),

  getRechargeByPlanId: (planId: number) =>
    api.get(`/recharge/plan/${planId}`),

  getMyRecharges: () =>
    api.get('/recharge/myrecharges'),

  updateRechargeStatus: (id: number, status: string) =>
    api.put(`/recharge/${id}/status`, null, { params: { status } }),

  deleteRecharge: (id: number) =>
    api.delete(`/recharge/delete-recharge/${id}`),
};

export const paymentService = {
  createOrder: (data: RazorpayOrderRequestDTO) =>
    api.post('/transaction/create-order', data),

  verifyPayment: (data: PaymentVerifyRequestDTO) =>
    api.post('/transaction/verify', data),

  getMyTransactions: () =>
    api.get('/transaction/mytransactions'),

  getTransactionsByUserId: (userId: number) =>
    api.get(`/transaction/user/${userId}`),

  getTransactionByRechargeId: (rechargeId: number) =>
    api.get(`/transaction/recharge/${rechargeId}`),
};
