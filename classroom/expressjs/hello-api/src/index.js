import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import routes from './routes.js';
import { errorHandler, notFoundHandler } from './errorHandlers.js';
import swaggerSpec from './swagger.js';

const app = express();
app.use(morgan('tiny'));

app.use(express.json());

app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

export default app;
