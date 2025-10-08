# Front Pochini Backup

React Native мобильное приложение для аутентификации пользователей с верификацией через код подтверждения.


## Технологии

- **React Native** - фреймворк для разработки мобильных приложений
- **TypeScript** - типизированный JavaScript
- **MobX** - управление состоянием
- **Axios** - HTTP клиент
- **Jest** - фреймворк для тестирования
- **React Native Testing Library** - тестирование компонентов

## Требования


- **Node.js** >= 18.18.0
- **npm** >= 8.0.0
- **React Native CLI** (для запуска на устройстве/эмуляторе)

Проверьте версии:

```bash
node -v   # v18.18.0 или выше
npm -v    # 8.0.0 или выше
```

---

## Установка

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/ваш_username/Front_pochini_backup.git
cd Front_pochini_backup
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Настройте окружение

Создайте файл `.env` в корне проекта:

```bash
cat > .env << 'EOF'
API_URL=http://localhost:3000/api
EOF
```

## Запуск проекта

### Запуск Metro Bundler

```bash
npm start
```

### Запуск на Android

```bash
# В отдельном терминале
npm run android
```

### Запуск на iOS (только macOS)

```bash
# Установите pods
cd ios && pod install && cd ..

# Запустите
npm run ios
```

### Запуск в режиме разработки

```bash
# Metro bundler
npm start

# В другом терминале - Android
npx react-native run-android

# Или iOS
npx react-native run-ios
```

---

## Тестирование

### Запуск всех тестов

```bash
npm test
```

### Запуск с покрытием кода

```bash
npm run test:coverage
```

Или напрямую через Jest:

```bash
npx jest --coverage
```

### Запуск в watch режиме

```bash
npm run test:watch
```

### Запуск конкретного теста

```bash
npm test -- test1-authModel-setUser
```

### Очистка кэша

```bash
npx jest --clearCache
```

