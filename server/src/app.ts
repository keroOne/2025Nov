import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import todosRouter from './routes/todos.js';

const app = express();

// ミドルウェア
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/todos', todosRouter);

// エラーハンドリング
app.use(errorHandler);

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

export default app;

