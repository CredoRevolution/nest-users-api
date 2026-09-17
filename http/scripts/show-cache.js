// Обработчик ответа для GET-запросов в playground.http.
// CacheInterceptor сам ставит заголовок X-Cache: MISS — ответ собран заново
// и положен в Redis, HIT — ответ взят из Redis, контроллер не вызывался.
// У роутов без кэша (например, /users/active) заголовка нет.

const cache = response.headers.valueOf("X-Cache");

client.log(`${response.status}  X-Cache: ${cache ?? "— (роут не кэшируется)"}`);
