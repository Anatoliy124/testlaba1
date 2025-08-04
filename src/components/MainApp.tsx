// src/components/MainApp.tsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { authModel } from '../models/AuthModel';
import { LoginScreen } from '../views/LoginScreen';
import { CodeVerificationScreen } from '../views/CodeVerificationScreen';
import { DashboardScreen } from '../views/DashboardScreen'; // Это ваш основной экран после входа
import { checkAuthStatus } from '../controller/AuthController';

export const MainApp = observer(() => {
  useEffect(() => {
    // Проверяем статус авторизации при запуске приложения
    checkAuthStatus();
  }, []);

  // Если пользователь авторизован, показываем основной интерфейс
  if (authModel.isLoggedIn && authModel.user) {
    return <DashboardScreen />;
  }

  // Если находимся на этапе ввода кода
  if (authModel.verificationStep === 'code' && authModel.loginId) {
    return <CodeVerificationScreen />;
  }

  // По умолчанию показываем экран входа
  return <LoginScreen />;
});