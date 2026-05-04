import api from '../api/client';
import type { OperatorRequestDTO, PlanRequestDTO } from '../../shared/types';

export const operatorService = {
  getAllOperators: () =>
    api.get('/operators/getList'),

  getOperator: (id: number) =>
    api.get(`/operators/${id}`),

  createOperator: (data: OperatorRequestDTO) =>
    api.post('/operators/register', data),

  updateOperator: (id: number, data: OperatorRequestDTO) =>
    api.put(`/operators/update/${id}`, data),

  deleteOperator: (id: number) =>
    api.delete(`/operators/delete/${id}`),
};

export const planService = {
  getAllPlans: () =>
    api.get('/plans'),

  getPlan: (id: number) =>
    api.get(`/plans/${id}`),

  getPlansByOperator: (operatorId: number) =>
    api.get(`/plans/operator/${operatorId}`),

  createPlan: (data: PlanRequestDTO) =>
    api.post('/plans/create', data),

  updatePlan: (id: number, data: PlanRequestDTO) =>
    api.put(`/plans/update/${id}`, data),

  deletePlan: (id: number) =>
    api.delete(`/plans/delete/${id}`),
};

export const normalizeCollection = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = ['data', 'content', 'items', 'results'];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};
