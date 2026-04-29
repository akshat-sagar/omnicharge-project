import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { AuthState, UserResponseDTO } from '../../types';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { clearAuthStorage, tokenStorage, userStorage } from '../../utils/storage';
import { getErrorMessage } from '../../utils/helpers';

const initialState: AuthState = {
  user: userStorage.getUser(),
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const data = response.data as Record<string, unknown>;
      const accessToken =
        typeof data.accessToken === 'string'
          ? data.accessToken
          : typeof data.token === 'string'
          ? data.token
          : null;
      const refreshToken = typeof data.refreshToken === 'string' ? data.refreshToken : null;
      const user = (data.user ?? data.profile ?? null) as UserResponseDTO | null;

      if (!accessToken) {
        throw new Error('Login response did not include an access token.');
      }

      tokenStorage.setAccessToken(accessToken);
      if (refreshToken) {
        tokenStorage.setRefreshToken(refreshToken);
      }
      if (user) {
        userStorage.setUser(user);
      }

      return { accessToken, refreshToken, user };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      const user = response.data as UserResponseDTO;
      userStorage.setUser(user);
      return user;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      return rejectWithValue({
        message: getErrorMessage(err),
        status: axiosError.response?.status ?? null,
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string; user?: UserResponseDTO }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
      if (action.payload.user) state.user = action.payload.user;
      state.isAuthenticated = true;
      tokenStorage.setAccessToken(action.payload.accessToken);
      if (action.payload.refreshToken) tokenStorage.setRefreshToken(action.payload.refreshToken);
      if (action.payload.user) userStorage.setUser(action.payload.user);
    },
    logout: (state) => {
      clearAuthStorage();
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<UserResponseDTO>) => {
      state.user = action.payload;
      userStorage.setUser(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message?: string; status?: number | null } | undefined;
        state.error = payload?.message || 'Failed to load profile';

        if (payload?.status === 401) {
          clearAuthStorage();
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { setCredentials, logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
