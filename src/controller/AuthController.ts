import axios from 'axios';
import { authModel } from '../models/AuthModel';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Настройка axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Отправка кода верификации
export const sendVerificationCode = async (
  login: string,
  contact: string,
  contactType: 'email' | 'phone'
): Promise<{ success: boolean; error?: string }> => {
  try {
    authModel.setLoading(true);
    authModel.clearError();

    const response = await api.post('/auth/send-code', {
      login,
      contact,
      contactType,
    });

    authModel.setLoading(false);

    if (response.data.success) {
      return { success: true };
    } else {
      return { success: false, error: response.data.error || 'Unknown error' };
    }
  } catch (error: any) {
    authModel.setLoading(false);
    const errorMessage = error.response?.data?.error || error.message || 'Network error';
    authModel.setError(errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Верификация кода
export const verifyCode = async (
  login: string,
  code: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    authModel.setLoading(true);
    authModel.clearError();

    const response = await api.post('/auth/verify-code', {
      login,
      code,
    });

    authModel.setLoading(false);

    if (response.data.success) {
      authModel.setUser(response.data.user);
      return { success: true, token: response.data.token };
    } else {
      authModel.setError(response.data.error);
      return { success: false, error: response.data.error };
    }
  } catch (error: any) {
    authModel.setLoading(false);
    const errorMessage = error.response?.data?.error || error.message || 'Network error';
    authModel.setError(errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Logout
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    await api.post('/auth/logout');
    authModel.clearUser();
    authModel.clearError();
    return { success: true };
  } catch (error) {
    // Даже если запрос упал, очищаем локально
    authModel.clearUser();
    authModel.clearError();
    return { success: true };
  }
};
