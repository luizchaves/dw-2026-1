import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import hostRoutes from './routes/hosts.js';
import Seed from './database/seeders.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import swaggerSpec from './docs/swagger.js';

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

Seed.up();

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

export default app;
