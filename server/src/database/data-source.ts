// src/data-source.ts

import dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as entities from './entities';
const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = 'root',
  DB_NAME = 'postgres',
} = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST || 'localhost',
  port: Number(DB_PORT) || 5432,
  username: DB_USERNAME || 'postgres',
  password: DB_PASSWORD || 'root',
  database: DB_NAME || 'postgres',
  synchronize: true,
  logging: false,
  entities: Object.values(entities).filter(
    (e) => typeof e === 'function',
  ) as Function[],
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
