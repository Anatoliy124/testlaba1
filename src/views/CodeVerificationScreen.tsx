import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  verifyCode,
  resendVerificationCode,
  resetVerification
} from '../controller/AuthController';
import { authModel } from '../models/AuthModel';

export const CodeVerificationScreen = observer(() => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Таймер для повторной отправки кода
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Автофокус на первое поле при загрузке
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericValue;
      setCode(newCode);

      // Автоматический переход к следующему полю
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Автоматическая отправка при заполнении всех полей
      if (index === 5 && numericValue) {
        const fullCode = [...newCode].join('');
        if (fullCode.length === 6) {
          setTimeout(() => handleVerifyCode(fullCode), 100);
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Обработка Backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Ошибка', 'Введите полный 6-значный код');
      return;
    }

    const result = await verifyCode(codeToVerify);
    
    if (result.success) {
      Alert.alert(
        'Успешно!',
        'Номер телефона подтвержден',
        [{ text: 'Продолжить', onPress: () => {
          // Навигация будет происходить автоматически через authModel.isLoggedIn
        }}]
      );
    } else {
      Alert.alert('Ошибка', result.error || 'Неверный код подтверждения');
      // Очищаем поля при ошибке
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    const result = await resendVerificationCode();

    if (result.success) {
      setResendTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      Alert.alert('Код отправлен', 'Новый код отправлен на ваш номер телефона');
      inputRefs.current[0]?.focus();
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось отправить код повторно');
    }
  };

  const handleChangeNumber = () => {
    Alert.alert(
      'Изменить номер?',
      'Вы уверены, что хотите изменить номер телефона?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да',
          onPress: () => resetVerification(),
          style: 'destructive'
        }
      ]
    );
  };

  const clearAllFields = () => {
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Введите код</Text>
          <Text style={styles.subtitle}>
            Код отправлен на {authModel.contactType === 'email' ? 'email' : 'номер'}{'\n'}
            <Text style={styles.contactValue}>{authModel.formattedContact}</Text>
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <View style={styles.codeInputsRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                placeholderTextColor="#ccc"
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFields}
          >
            <Text style={styles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (code.join('').length !== 6 || authModel.isLoading) && styles.verifyButtonDisabled
          ]}
          onPress={() => handleVerifyCode()}
          disabled={code.join('').length !== 6 || authModel.isLoading}
        >
          {authModel.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.verifyButtonText}>Проверяем...</Text>
            </View>
          ) : (
            <Text style={styles.verifyButtonText}>Подтвердить</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
            >
              <Text style={styles.resendButtonText}>Отправить код повторно</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Повторная отправка через {formatTime(resendTimer)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={handleChangeNumber}
        >
          <Text style={styles.changeNumberButtonText}>
            Изменить {authModel.contactType === 'email' ? 'email' : 'номер'}
          </Text>
        </TouchableOpacity>

        {authModel.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authModel.error}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  contactValue: {
    fontWeight: '600',
    color: '#007AFF',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  codeInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
  },
  codeInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resendTimer: {
    color: '#666',
    fontSize: 16,
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  changeNumberButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#D63031',
    fontSize: 14,
    textAlign: 'center',
  },
});