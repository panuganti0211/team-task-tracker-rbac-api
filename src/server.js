import config from './config/index.js';
import app from './app.js';

const startServer = async () => {
  try {
    app.listen(config.port, config.host, () => {
      console.log(`🚀 Server running on http://${config.host}:${config.port}`);
      console.log(`📚 API Documentation: http://${config.host}:${config.port}/api-docs`);
      console.log(`🏥 Health Check: http://${config.host}:${config.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
