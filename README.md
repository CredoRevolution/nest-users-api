# Users API

Учебный проект на NestJS + PostgreSQL: регистрация, JWT с ротацией refresh-токенов,
профиль, список пользователей с пагинацией, мягкое удаление.

## Запуск

```bash
docker compose up -d
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

API — http://localhost:3000, Swagger — http://localhost:3000/docs

## Миграции

Схемой управляют миграции, `synchronize` выключен — на пустой базе без
`npm run migration:run` таблиц не будет.

```bash
npm run migration:run                          # накатить
npm run migration:revert                       # откатить последнюю
npm run migration:show                         # что применено
npm run migration:generate src/migrations/Name # сгенерировать по сущностям
```

`migration:generate` сравнивает сущности с текущей базой, поэтому запускать его
нужно на базе, где уже накатаны все предыдущие миграции.

## Линтер

```bash
npm run lint      # проверить
npm run lint:fix  # починить автоматически
```

## Роуты

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | все | регистрация, возвращает пару токенов |
| POST | `/auth/login` | все | вход по логину и паролю |
| POST | `/auth/refresh` | все | новая пара токенов, старый refresh сгорает |
| GET | `/profile/my` | по токену | свой профиль целиком |
| PATCH | `/profile/my` | по токену | обновление своего профиля |
| DELETE | `/profile/my` | по токену | мягкое удаление своего аккаунта |
| GET | `/users` | по токену | список: `page`, `limit`, `login` |
| GET | `/users/:id` | по токену | пользователь по id |

Пример ответа `GET /users?page=1&limit=10&login=sas`:

```json
{
  "data": [{ "id": 1, "login": "sasha", "email": "sasha@example.com", "age": 28, "about": null }],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

## Тесты

```bash
npm test
```

Ручные запросы для HTTP Client лежат в `http/`.
