import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './database/data-source';
import routes from './routes';
import { errorHandler } from './common/middleware/errorHandler';
import { notFoundHandler } from './common/middleware/notFoundHandler';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Log all requests in 'dev' format
app.use(morgan('dev'));

app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || '',
      process.env.FRONTEND_URL || '',
      'http://localhost:5173',
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
import path from 'path';

app.use('/api', routes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log('App running on port', PORT);
    });
  })
  .catch((err) => {
    console.error('Error initializing data source', err);
  });
