// src/controller/AuthController.ts
import axios from 'axios';
import { authModel } from '../models/AuthModel';
import { API_URL } from '@env';

// Настройка axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерсептор для добавления токена
api.interceptors.request.use((config) => {
  if (authModel.authToken) {
    config.headers.Authorization = `Bearer ${authModel.authToken}`;
  }
  return config;
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек, разлогиниваем пользователя
      authModel.logout();
    }
    return Promise.reject(error);
  }
);

// Типы для API ответов
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface SendVerificationResponse {
  loginId: string;
  expiresIn: number;
  isNewUser?: boolean; // Новый пользователь или существующий
}

interface VerifyCodeResponse {
  user: any;
  token: string;
  refreshToken?: string;
}

// Шаг 1: Универсальная отправка кода (логин/регистрация)
export const sendVerificationCode = async (
  login: string,
  contactValue: string,
  contactType: 'email' | 'phone'
) => {
  try {
    authModel.setLoading(true);
    authModel.setError(null);

    if (!login || login.trim().length < 3) {
      throw new Error('Логин должен содержать минимум 3 символа');
    }

    if (!contactValue || !contactType) {
      throw new Error('Укажите email или номер телефона');
    }

    // Валидация в зависимости от типа
    if (contactType === 'phone') {
      const cleaned = contactValue.replace(/\D/g, '');
      if (cleaned.length !== 11 || !cleaned.startsWith('7')) {
        throw new Error('Некорректный номер телефона');
      }
    } else if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactValue)) {
        throw new Error('Некорректный email адрес');
      }
    }

    // Универсальный эндпоинт для логина/регистрации
    const response = await api.post<ApiResponse<SendVerificationResponse>>('/auth/send-verification', {
      login: login.trim(),
      contactValue: contactValue,
      contactType: contactType
    });

    if (response.data.success && response.data.data) {
      // Сохраняем данные из ответа
      authModel.setLoginId(response.data.data.loginId);
      authModel.setContactValue(contactValue);
      authModel.setContactType(contactType);
      authModel.setLogin(login);
      authModel.setVerificationStep('code');
      authModel.setLastVerificationTime(new Date());

      return {
        success: true,
        loginId: response.data.data.loginId,
        expiresIn: response.data.data.expiresIn,
        isNewUser: response.data.data.isNewUser
      };
    } else {
      const errorMessage = response.data.message || 'Ошибка отправки кода';
      authModel.setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    let errorMessage = 'Ошибка при отправке кода';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    authModel.setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    authModel.setLoading(false);
  }
};

// Шаг 2: Подтверждение кода из SMS/Email
export const verifyCode = async (code: string) => {
  try {
    authModel.setLoading(true);
    authModel.setError(null);

    if (!authModel.loginId) {
      throw new Error('Login ID не найден. Запросите код повторно.');
    }

    if (!code || code.length < 4) {
      throw new Error('Введите корректный код');
    }

    const response = await api.post<ApiResponse<VerifyCodeResponse>>('/auth/verify-code', {
      loginId: authModel.loginId,
      code: code.trim()
    });

    if (response.data.success && response.data.data) {
      const { user, token, refreshToken } = response.data.data;

      // Сохраняем данные пользователя и токен
      authModel.setUser(user);
      authModel.setAuthToken(token);

      // Можно сохранить в AsyncStorage если нужно
      // await AsyncStorage.setItem('authToken', token);
      // if (refreshToken) {
      //   await AsyncStorage.setItem('refreshToken', refreshToken);
      // }

    return {
        success: true,
        user: user,
        token: token
      };
    } else {
      const errorMessage = response.data.message || 'Неверный код подтверждения';
      authModel.setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    let errorMessage = 'Ошибка при проверке кода';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    authModel.setError(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    authModel.setLoading(false);
  }
};

// Повторная отправка кода
export const resendVerificationCode = async () => {
  if (!authModel.contactValue) {
    authModel.setError('Контактные данные не найдены');
    return { success: false, error: 'Контактные данные не найдены' };
  }

  if (!authModel.login) {
    authModel.setError('Логин не найден');
    return { success: false, error: 'Логин не найден' };
  }

  if (!authModel.contactType) {
    authModel.setError('Тип контакта не определен');
    return { success: false, error: 'Тип контакта не определен' };
  }

  if (!authModel.canResendCode) {
    authModel.setError('Подождите перед повторной отправкой');
    return { success: false, error: 'Подождите перед повторной отправкой' };
  }

  return await sendVerificationCode(
    authModel.login,
    authModel.contactValue,
    authModel.contactType
  );
};

// Выход из системы
export const logout = async () => {
  try {
    // Опционально: запрос на сервер для инвалидации токена
    if (authModel.authToken) {
      await api.post('/auth/logout');
    }
  } catch (error) {
    // Игнорируем ошибки при выходе
    console.warn('Ошибка при выходе:', error);
  } finally {
    // Очищаем локальные данные
    authModel.logout();
    
    // Очищаем AsyncStorage если используется
    // await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
  }
};

// Сброс процесса верификации
export const resetVerification = () => {
  authModel.reset();
};

// Проверка статуса авторизации (можно вызывать при запуске приложения)
export const checkAuthStatus = async () => {
  try {
    if (!authModel.authToken) {
      return { success: false, error: 'Токен не найден' };
    }

    const response = await api.get<ApiResponse<{ user: any }>>('/auth/me');
    
    if (response.data.success && response.data.data) {
      authModel.setUser(response.data.data.user);
      return { success: true, user: response.data.data.user };
    } else {
      authModel.logout();
      return { success: false, error: 'Неверный токен' };
    }
  } catch (error: any) {
    authModel.logout();
    return { success: false, error: 'Ошибка проверки авторизации' };
  }
};