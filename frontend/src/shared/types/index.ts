// Auth types
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// User types
export type UserRole = 'USER' | 'ADMIN';

export interface UserRequestDTO {
  name: string;
  email: string;
  contactNo?: string;
  password?: string;
}

export interface UserResponseDTO {
  serialIzableID?: number;
  userId: number;
  name: string;
  email: string;
  contactNo?: string;
  role: UserRole;
}

export interface RoleUpdateDTO {
  role: UserRole;
}

// Operator types
export interface OperatorRequestDTO {
  name: string;
}

export interface OperatorResponseDTO {
  serialIzableID?: number;
  id: number;
  name: string;
}

// Plan types
export interface PlanRequestDTO {
  amount: number;
  validity: string;
  description: string;
  operatorId?: number;
}

export interface PlanResponseDTO {
  serialIzableID?: number;
  id: number;
  operatorId?: number;
  amount: number;
  validity: string;
  description: string;
}

// Recharge types
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';
export type RechargeStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';

export interface RechargeRequestDTO {
  operatorId: number;
  planId: number;
  paymentMethod: PaymentMethod;
  mobileNumber: string;
}

export interface RechargeResponseDTO {
  serialIzableID?: number;
  rechargeId: number;
  status: RechargeStatus;
  amount: number;
  planId: number;
  transactionStatus?: string;
  userId: number;
}

// Transaction types
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING';

export interface RazorpayOrderRequestDTO {
  rechargeId: number;
  paymentMethod: string;
}

export interface RazorpayOrderResponseDTO {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface PaymentVerifyRequestDTO {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface TransactionResponseDTO {
  amount: number;
  transactionStatus: TransactionStatus;
  paymentMethod: PaymentMethod;
  timestamp: string;
  rechargeId: number;
}

// Notification types
export interface NotificationEvent {
  message?: string;
  email?: string;
  phoneNumber?: string;
  type?: string;
  subject?: string;
  rechargeId?: string;
  mobile?: string;
  operator?: string;
  amount?: number;
  date?: string;
}

// Pagination
export interface Pageable {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageRechargeResponseDTO {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: RechargeResponseDTO[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// Auth state
export interface AuthState {
  user: UserResponseDTO | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
