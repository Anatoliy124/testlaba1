import React, { useState } from 'react';
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
import { sendVerificationCode } from '../controller/AuthController';
import { authModel } from '../models/AuthModel';

export const LoginScreen = observer(() => {
  const [contact, setContact] = useState(''); // email или phone
  const [contactType, setContactType] = useState<'email' | 'phone' | null>(null);
  const [isContactValid, setIsContactValid] = useState(false);

  // Валидация email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона
  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('7');
  };

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 11) return contact;
    
    let formatted = cleaned;
    if (cleaned.startsWith('8')) {
      formatted = '7' + cleaned.slice(1);
    }
    if (cleaned.length > 0 && !cleaned.startsWith('7')) {
      formatted = '7' + cleaned;
    }

    let display = '';
    if (formatted.length > 0) {
      display = '+7';
      if (formatted.length > 1) {
        display += ' (' + formatted.slice(1, 4);
        if (formatted.length > 4) {
          display += ') ' + formatted.slice(4, 7);
          if (formatted.length > 7) {
            display += '-' + formatted.slice(7, 9);
            if (formatted.length > 9) {
              display += '-' + formatted.slice(9, 11);
            }
          }
        }
      }
    }
    return display;
  };

  const handleContactChange = (value: string) => {
    let newValue = value;
    let newContactType: 'email' | 'phone' | null = null;
    let isValid = false;

    // Определяем тип ввода
    if (value.includes('@')) {
      // Это email
      newContactType = 'email';
      isValid = isValidEmail(value);
    } else if (/^\+?[0-9\s\-\(\)]*$/.test(value)) {
      // Это телефон
      newContactType = 'phone';
      newValue = formatPhoneNumber(value);
      isValid = isValidPhone(newValue);
    }

    setContact(newValue);
    setContactType(newContactType);
    setIsContactValid(isValid);
  };

  const getCleanedContact = () => {
    if (contactType === 'phone') {
      return contact.replace(/\D/g, '');
    }
    return contact.trim();
  };

  const handleSendCode = async () => {
    if (!isContactValid) {
      Alert.alert('Ошибка', 'Введите корректный email или номер телефона');
      return;
    }

    if (!contactType) {
      Alert.alert('Ошибка', 'Не удалось определить тип контакта');
      return;
    }

    const cleanedContact = getCleanedContact();
    
    // Используем contact как логин (можно изменить логику)
    const login = contactType === 'email' ? cleanedContact : cleanedContact;

    const result = await sendVerificationCode(
      login,
      cleanedContact,
      contactType
    );

    if (result.success) {
      const contactDisplay = contactType === 'phone' ? contact : cleanedContact;
      Alert.alert(
        'Код отправлен',
        `Код подтверждения отправлен на ${contactDisplay}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось отправить код');
    }
  };

  const getContactPlaceholder = () => {
    return 'Email или +7 (999) 123-45-67';
  };

  const getContactLabel = () => {
    if (contactType === 'email') return 'Email';
    if (contactType === 'phone') return 'Номер телефона';
    return 'Email или телефон';
  };

  const handleClearContact = () => {
    setContact('');
    setContactType(null);
    setIsContactValid(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Вход в аккаунт</Text>
          <Text style={styles.subtitle}>
            Введите email или номер телефона.{'\n'}
            Мы отправим код подтверждения.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{getContactLabel()}</Text>
          <View style={styles.contactInputWrapper}>
            <TextInput
              placeholder={getContactPlaceholder()}
              value={contact}
              onChangeText={handleContactChange}
              style={[
                styles.contactInput,
                !isContactValid && contact.length > 0 && styles.contactInputError,
                isContactValid && styles.contactInputValid
              ]}
              keyboardType={contactType === 'phone' ? 'numeric' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
            {contact.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearContact}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {contactType && (
            <View style={styles.contactTypeIndicator}>
              <Text style={styles.contactTypeText}>
                {contactType === 'email' ? '📧 Email' : '📱 Телефон'}
              </Text>
            </View>
          )}

          {!isContactValid && contact.length > 0 && (
            <Text style={styles.validationText}>
              {contactType === 'email'
                ? 'Введите корректный email адрес'
                : 'Введите корректный российский номер телефона'
              }
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isContactValid || authModel.isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSendCode}
          disabled={!isContactValid || authModel.isLoading}
        >
          {authModel.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.sendButtonText}>Отправляем...</Text>
            </View>
          ) : (
            <Text style={styles.sendButtonText}>Получить код</Text>
          )}
        </TouchableOpacity>

        {authModel.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authModel.error}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Нажимая "Получить код", вы соглашаетесь с{'\n'}
            условиями использования и политикой конфиденциальности
          </Text>
        </View>
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactInputWrapper: {
    position: 'relative',
  },
  contactInput: {
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#333',
    paddingRight: 50, // место для кнопки очистки
  },
  contactInputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  contactInputValid: {
    borderColor: '#51CF66',
    backgroundColor: '#F3FFF3',
  },
  contactTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactTypeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  validationText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
    marginLeft: 4,
  },
  sendButton: {
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
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
  footer: {
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});