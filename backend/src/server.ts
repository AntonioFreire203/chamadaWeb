import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://localhost:${config.port}${config.apiPrefix}`);
  if (config.nodeEnv === 'development') {
    console.log(`📚 Docs: http://localhost:${config.port}/docs`);
  }
});