import apiClient from './client';
import { LoginRequest, RegisterRequest, TokenResponse, User } from './types';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    const { access_token, refresh_token, token_type, expires_in } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    
    return { access_token, token_type, expires_in };
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/auth/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/api/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Refresh token
  refreshToken: async (): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/refresh');
    const { access_token, refresh_token } = response.data;
    
    // Update stored tokens
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    
    return response.data;
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
