import { makeObservable, observable, action, computed } from 'mobx';

class AuthModel {
  // Основные состояния
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  error: string | null = null;
  user: any = null;

  // Поля для верификации
  loginId: string | null = null;
  contactValue: string = ''; // email или телефон
  contactType: 'email' | 'phone' | null = null;
  login: string = '';
  isVerified: boolean = false;
  verificationStep: 'registration' | 'code' | 'completed' = 'registration';

  // Дополнительные поля
  authToken: string | null = null;
  lastVerificationTime: Date | null = null;

  constructor() {
    makeObservable(this, {
      // Observable свойства
      isLoading: observable,
      isLoggedIn: observable,
      error: observable,
      user: observable,
      loginId: observable,
      contactValue: observable,
      contactType: observable,
      login: observable,
      isVerified: observable,
      verificationStep: observable,
      authToken: observable,
      lastVerificationTime: observable,

      // Actions (методы изменяющие состояние)
      setLoading: action,
      setError: action,
      setUser: action,
      setLoginId: action,
      setContactValue: action,
      setContactType: action,
      setLogin: action,
      setVerificationStep: action,
      setAuthToken: action,
      setLastVerificationTime: action,
      reset: action,
      logout: action,

      // Computed свойства - ИСПРАВЛЕНО
      canResendCode: computed,
      formattedContact: computed, // Было formattedPhoneNumber
    });
  }

  // Actions
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setUser(user: any) {
    this.user = user;
    this.isLoggedIn = !!user;
    if (user) {
      this.verificationStep = 'completed';
    }
  }

  setLoginId(loginId: string | null) {
    this.loginId = loginId;
  }

  setContactValue(contact: string) {
    this.contactValue = contact;
  }

  setContactType(type: 'email' | 'phone' | null) {
    this.contactType = type;
  }

  setLogin(login: string) {
    this.login = login;
  }

  setVerificationStep(step: 'registration' | 'code' | 'completed') {
    this.verificationStep = step;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setLastVerificationTime(time: Date | null) {
    this.lastVerificationTime = time;
  }

  reset() {
    this.loginId = null;
    this.contactValue = '';
    this.contactType = null;
    this.login = '';
    this.isVerified = false;
    this.verificationStep = 'registration';
    this.error = null;
    this.isLoading = false;
    this.lastVerificationTime = null;
  }

  logout() {
    this.user = null;
    this.isLoggedIn = false;
    this.authToken = null;
    this.error = null;
    this.reset();
  }

  // Computed свойства
  get canResendCode(): boolean {
    if (!this.lastVerificationTime) return true;

    const now = new Date();
    const diff = now.getTime() - this.lastVerificationTime.getTime();
    return diff > 60000; // 60 секунд
  }

  get formattedContact(): string {
    if (!this.contactValue) return '';

    if (this.contactType === 'phone') {
      const cleaned = this.contactValue.replace(/\D/g, '');
      if (cleaned.startsWith('7') && cleaned.length === 11) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
      }
    }

    return this.contactValue;
  }
}

export const authModel = new AuthModel();