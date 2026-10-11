# Users API

Учебный проект на NestJS + PostgreSQL: регистрация, JWT с ротацией refresh-токенов,
профиль, список пользователей с пагинацией, мягкое удаление, аватарки в MinIO,
кэш ответов в Redis, баланс с переводами в транзакции и фоновое обнуление
балансов через очередь BullMQ.

## Что нужно заранее

- Node.js 20+ и npm
- Docker с Docker Compose

## Запуск с нуля

```bash
cp .env.example .env      # первым делом: compose.yaml тоже читает .env
docker compose up -d      # Postgres, Redis, MinIO + разовая настройка MinIO
npm install               # заодно ставит git-хук husky
npm run migration:run     # таблицы — только миграциями
npm run start:dev
```

API — http://localhost:3200, Swagger — http://localhost:3200/docs

Проверить, что всё живо: прогнать `http/00-smoke.http` в HTTP Client
(окружение `dev`, порт 3200 там уже прописан).

## Что поднимает Docker

| Сервис | Порт | Зачем |
|---|---|---|
| `postgres` | 5432 | основная база |
| `redis` | 6379 | кэш ответов и очередь BullMQ, пароль из `.env` |
| `minio` | 9000, консоль 9001 | хранилище аватарок, S3-совместимое |
| `minio-init` | — | разовый: создаёт бакет и ключ приложения, потом выходит |

Консоль MinIO: http://localhost:9001, логин `minioadmin` / `minioadmin`.
Приложение ходит в MinIO не под root, а под ключом `MINIO_ACCESS_KEY` —
его создаёт `minio-init` из значений в `.env`.

Снести всё вместе с данными: `docker compose down -v`.

## Переменные окружения

Все лежат в `.env.example`, для локального запуска менять ничего не нужно.

| Переменная | Пример | Что это |
|---|---|---|
| `PORT` | `3200` | порт приложения |
| `NODE_ENV` | не задана | `production` убирает `debug`/`verbose` из логов и закрывает `/transfer/crash` |
| `DB_HOST`, `DB_PORT` | `localhost`, `5432` | Postgres из compose |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `nestuser`, `nestpass`, `nest_users` | совпадают с `compose.yaml` |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES` | любая строка, `15m` | access-токен |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES` | любая строка, `7d` | refresh-токен |
| `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | `nestapp`, `nestapp-secret-123` | ключ приложения в MinIO |
| `S3_BUCKET_NAME` | `avatars` | бакет для аватарок |
| `S3_ENDPOINT` | `http://127.0.0.1:9000` | адрес MinIO |
| `REDIS_HOST`, `REDIS_PORT` | `localhost`, `6379` | Redis из compose |
| `REDIS_USERNAME`, `REDIS_PASSWORD` | `default`, `redis_pass` | пароль подхватывает и `compose.yaml` |

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

Что сейчас в `src/migrations`: начальная схема, версия токена у пользователя,
аватарки, индексы, баланс с `CHECK (balance >= 0)`.

## Логи

Каждый запрос, дошедший до контроллера, пишется одной строкой:
`POST /auth/register 409 5ms`. 4xx — `WARN`, 5xx — `ERROR`. Статус берётся
в момент отправки ответа, уже после фильтров исключений.

Отдельно логируются переводы денег, обнуление балансов и загрузка аватарок.
Пароли, хэши и токены в логи не попадают.

## Линтер

```bash
npm run lint      # проверить
npm run lint:fix  # починить автоматически
```

Перед каждым коммитом husky запускает lint-staged: `eslint --fix` по
изменённым `.ts`. Ошибка линтера — коммит не создаётся. В VS Code
форматирование и eslint-фиксы срабатывают при сохранении (`.vscode/settings.json`).

## Роуты

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| POST | `/auth/register` | все | регистрация, возвращает пару токенов |
| POST | `/auth/login` | все | вход по логину и паролю |
| POST | `/auth/refresh` | все | новая пара токенов, старый refresh сгорает; повторное использование отзывает все refresh пользователя |
| GET | `/profile/my` | по токену | свой профиль целиком |
| PATCH | `/profile/my` | по токену | обновление своего профиля; смена пароля завершает все сессии |
| DELETE | `/profile/my` | по токену | мягкое удаление своего аккаунта, все сессии завершаются |
| POST | `/profile/my/avatars` | по токену | загрузить аватарку (png/jpeg, поле `avatar`, до 10 МБ, не больше 5 активных) |
| DELETE | `/profile/my/avatars/:id` | по токену | удалить свою аватарку |
| GET | `/profile/my/balance` | по токену | свой баланс |
| POST | `/profile/my/balance/deposit` | по токену | пополнить |
| POST | `/profile/my/balance/withdraw` | по токену | снять, в минус не уходит |
| POST | `/profile/my/balance/transfer` | по токену | перевод другому пользователю, одной транзакцией |
| POST | `/profile/my/balance/transfer/crash` | по токену, не в production | перевод, падающий посередине, — проверка отката |
| POST | `/balance-reset` | по токену | поставить в очередь обнуление всех балансов; само по себе оно идёт каждые 10 минут |
| GET | `/users` | по токену | список: `page`, `limit`, `login`; кэшируется так же, как `/users/:id` |
| GET | `/users/active` | по токену | активные пользователи: `minAge`, `maxAge` |
| GET | `/users/:id` | по токену | пользователь по id, кэшируется в Redis на 30 секунд (`X-Cache: HIT/MISS`) |

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

Ручные запросы для HTTP Client лежат в `http/`, порядок и описание — в `http/README.md`.
