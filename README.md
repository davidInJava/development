# Backend API для управления документами

Этот проект представляет собой NestJS API для управления документами пользователей, с интеграцией MinIO для хранения файлов.

## Требования

- Node.js (версия 18+)
- npm или yarn
- Docker и Docker Compose (для MinIO и PostgreSQL)
- PostgreSQL (или используйте Docker)

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd backend
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения в файле `.env` (см. раздел ниже).

4. Запустите MinIO и базу данных:
```bash
docker-compose up -d
```

5. Запустите сервер в режиме разработки:
```bash
npm run start:dev
```

Сервер будет доступен на `http://localhost:4000`.

## Переменные окружения (.env)

Создайте файл `.env` в корне проекта со следующими переменными:

```env
NODE_ENV=development
PORT=4000

# База данных PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=davit
DATABASE_NAME=postgres

# Логирование
LOG_LEVEL=debug

# JWT токены
JWT_SECRET=4f8d9b1a6efc4f7b8a3d0e9c2f5b7d1e
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=9c3e7a1f2b4d8e6a0f3t5b7d9a1e2f4c
JWT_REFRESH_EXPIRATION=7d

# Секретные ключи для админа и агентства
SECRETKEYADMIN=admin-secret-123
SECRETKEYAGENCY=agency-secret-456

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# MinIO настройки
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=documents
```

## Запуск MinIO

MinIO запускается через Docker Compose:

```bash
docker-compose up -d
```

После запуска MinIO будет доступен:
- API: `http://localhost:9000`
- Консоль: `http://localhost:9001`

Логин: `minio`
Пароль: `minio123`

## API Endpoints

### Аутентификация

- `POST /auth/login` - Вход для пользователей
- `POST /auth/register` - Регистрация пользователей

### Документы (требуют JWT токена person)

Все endpoints для документов требуют Bearer токена в заголовке `Authorization`.

- `POST /documents/upload` - Загрузка документа
  - Тело: multipart/form-data
  - Поля: `file` (файл), `documentType`, `documentNumber`, `issueDate`, `issuedBy`
  - `documentType` может быть: "паспорт", "удостоверение личности", "свидетельство о рождении", "свидетельство о браке", "справка о прописке", "другое"

- `GET /documents` - Получить все документы пользователя

- `DELETE /documents/:id` - Удалить документ по ID

### Пример использования

1. Получите JWT токен через `/auth/login` или `/auth/register`.

2. Загрузите документ:
```bash
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "documentType=паспорт" \
  -F "documentNumber=1234567890" \
  -F "issueDate=2000-01-01" \
  -F "issuedBy=ГУ МВД"
```

3. Получите список документов:
```bash
curl -X GET http://localhost:4000/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Структура проекта

- `src/modules/auth/` - Аутентификация и авторизация
- `src/modules/person/` - Управление пользователями (persons)
- `src/modules/citizen/` - Функционал для граждан
- `src/modules/documents/` - Управление документами
- `src/database/entities/` - Сущности базы данных
- `docker-compose.yml` - Конфигурация MinIO

## База данных

Проект использует PostgreSQL с TypeORM. В режиме разработки (`NODE_ENV=development`) схема автоматически синхронизируется.

## Тестирование

```bash
# Запуск тестов
npm run test

# E2E тесты
npm run test:e2e
```

## Разработка

- `npm run start:dev` - Запуск в режиме разработки с hot-reload
- `npm run build` - Сборка для продакшена
- `npm run start:prod` - Запуск продакшен версии
