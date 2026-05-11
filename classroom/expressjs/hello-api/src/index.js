import express from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());

app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.send('Hello API');
});

app.get('/hello/en', (req, res) => {
  res.send('Hello, World!');
});

app.get('/hello/pt', (req, res) => {
  res.send('Olá, Mundo!');
});

app.get('/en/:name', (req, res) => {
  const { name } = req.params;

  res.json({ message: `Hello, ${name}!` });
});

app.get('/pt', (req, res) => {
  const { name } = req.query;

  res.json({ message: `Olá, ${name}!` });
});

app.post('/es', (req, res) => {
  const { name } = req.body;

  res.json({ message: `¡Hola, ${name}!` });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
