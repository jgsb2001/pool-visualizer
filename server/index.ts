import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on port ${PORT}`);
});

export { app };
