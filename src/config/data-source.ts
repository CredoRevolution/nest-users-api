import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities, migrations } from './database.config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Переменная окружения ${key} не задана — проверь .env`);
  }
  return value;
};

/**
 * DataSource только для TypeORM CLI (migration:generate / run / revert).
 * Приложение поднимает соединение через TypeOrmModule и databaseConfig —
 * список сущностей и миграций у них общий, чтобы схемы не разъезжались.
 */
export default new DataSource({
  type: 'postgres',
  host: required('DB_HOST'),
  port: Number(required('DB_PORT')),
  username: required('DB_USER'),
  password: required('DB_PASSWORD'),
  database: required('DB_NAME'),
  entities,
  migrations,
  synchronize: false,
});
