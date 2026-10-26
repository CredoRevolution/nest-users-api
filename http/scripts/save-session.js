// Обработчик ответа для register / login / refresh в playground.http.
// Кладёт пару токенов в глобальные переменные и достаёт из access-токена
// id и логин, чтобы дальше писать /users/{{user_id}} без лишнего запроса.

if (response.status !== 200 && response.status !== 201) {
    client.log(`Сессия НЕ сменилась: ${response.status}`);
    client.log(JSON.stringify(response.body));
} else {
    const {access_token, refresh_token} = response.body;
    const payload = decodeJwtPayload(access_token);

    client.global.set("access_token", access_token);
    client.global.set("refresh_token", refresh_token);
    client.global.set("user_id", String(payload.sub));
    client.global.set("user_login", payload.login);

    client.log(`Текущий пользователь: ${payload.login} (id ${payload.sub})`);
}

// В скриптах HTTP Client нет atob, поэтому base64url разбираем руками.
function decodeJwtPayload(token) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const input = token.split(".")[1];
    let bits = 0;
    let value = 0;
    let bytes = "";
    for (const char of input) {
        value = (value << 6) | alphabet.indexOf(char);
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            bytes += "%" + ((value >> bits) & 0xff).toString(16).padStart(2, "0");
        }
    }
    return JSON.parse(decodeURIComponent(bytes));
}
