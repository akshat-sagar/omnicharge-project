import api from '../api/client';
import type { UserRequestDTO, RoleUpdateDTO } from '../../shared/types';

export const userService = {
  register: (data: UserRequestDTO) =>
    api.post('/users/register', data),

  getAllUsers: () =>
    api.get('/users'),

  getUserById: (userId: number) =>
    api.get(`/users/${userId}`),

  getUserByEmail: (email: string) =>
    api.get(`/users/email/${email}`),

  getProfile: () =>
    api.get('/users/profile'),

  updateProfile: (data: UserRequestDTO) =>
    api.put('/users/profile/update', data),

  updateRole: (userId: number, data: RoleUpdateDTO) =>
    api.put(`/users/${userId}/role`, data),

  deleteUser: (userId: number) =>
    api.delete(`/users/${userId}`),
};
