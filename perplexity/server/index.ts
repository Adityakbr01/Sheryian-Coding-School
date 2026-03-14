import cors from 'cors';
import express from 'express';
import os from 'os';
import passport from 'passport';
import morgan from "morgan";
import http from 'http';
import env from './src/configs/ENV';
import router from './src/routes';
import './src/configs/passport.config'; // Initialize passport config
import logger from './src/utils/logger';
import { notFoundHandler } from './src/middlewares/notFound.middleware';
import { globalErrorHandler } from './src/middlewares/error.middleware';
import { initSocketIO } from './src/Sockets/socketIO';

const app = express();

const httpServer = http.createServer(app);

// Initialize Socket.io
initSocketIO(httpServer);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(morgan('dev'));

// Routes

app.use("/api/v1", router);

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Handle undefined Routes
app.use(notFoundHandler);

// Global Error Handling Middleware
app.use(globalErrorHandler);

const PORT = env.PORT || 3000;

httpServer.listen(PORT, () => {
  const interfaces = os.networkInterfaces();
  const getNetworkAddress = () => {
    for (const name of Object.keys(interfaces)) {
      for (const interfaceInfo of interfaces[name] || []) {
        const { address, family, internal } = interfaceInfo;
        if (family === 'IPv4' && !internal) {
          return address;
        }
      }
    }
    return 'localhost';
  };

  const ipAddress = getNetworkAddress();

  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`Network access:`);
  logger.info(`- Local:    http://localhost:${PORT}`);
  logger.info(`- Network:  http://${ipAddress}:${PORT}\n`);
});
