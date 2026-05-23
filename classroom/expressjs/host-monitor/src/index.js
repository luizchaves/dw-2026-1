import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { pathToFileURL } from 'node:url';

import hostRoutes from './routes/hosts.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import swaggerSpec from './docs/swagger.js';
import { pingAllHosts } from './jobs/pingHosts.js';

const PING_JOB_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

const app = express();
app.use(morgan('tiny'));

app.use(express.static('public'));

app.use(express.json());

app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', hostRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });

  setInterval(() => {
    pingAllHosts().catch((error) => {
      console.error('Ping job failed:', error);
    });
  }, PING_JOB_INTERVAL_MS);
}

export default app;
