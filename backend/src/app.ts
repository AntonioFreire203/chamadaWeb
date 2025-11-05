import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { router } from './routes';

const app = express();

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use(config.apiPrefix, router);

export { app };
