import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import itemsRouter from './routes/items.routes.js';
import { initializeSocketHandlers } from './socket.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api', itemsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', serverTime: Date.now() });
});

initializeSocketHandlers(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Socket.io enabled`);
});
