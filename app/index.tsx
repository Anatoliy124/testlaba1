import React from 'react';
import { observer } from 'mobx-react-lite';
import { LoginScreen } from '../src/views/LoginScreen';
import { CodeVerificationScreen } from '../src/views/CodeVerificationScreen';
import { authModel } from '../src/models/AuthModel';
import { View, Text, StyleSheet } from 'react-native';

const App = observer(() => {
  if (authModel.isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>
          Добро пожаловать! Вы успешно авторизованы.
        </Text>
        <Text style={styles.userInfo}>
          Пользователь: {authModel.user?.name || authModel.login}
        </Text>
        <Text style={styles.contactInfo}>
          Контакт: {authModel.formattedContact}
        </Text>
      </View>
    );
  }

  switch (authModel.verificationStep) {
    case 'code':
      return <CodeVerificationScreen />;
    case 'registration':
    default:
      return <LoginScreen />;
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 16,
    color: '#666',
  },
});

export default App;