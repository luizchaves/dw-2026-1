import { pathToFileURL } from 'node:url';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import swaggerSpec from '@/docs/swagger.js';
import { pingAllHosts } from '@/jobs/pingHosts.js';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandlers.js';
import hostRoutes from '@/routes/hosts.route.js';

const port = 3000;
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
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  setInterval(
    () => {
      pingAllHosts().catch((error: unknown) => {
        console.error('Ping job failed:', error);
      });
    },
    1 * 60 * 1000
  ); // Run every 1 minute
}

export default app;
