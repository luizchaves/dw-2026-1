# Host Monitor Vue

Frontend Vue 3 moderno para consumir a API Express em `classroom/expressjs/host-monitor`.

## Stack

- Vue 3 com Composition API e `<script setup>`
- TypeScript
- Vite
- Vue Router
- Pinia
- Lucide Vue

## Desenvolvimento

Instale as dependencias:

```bash
npm install
```

Suba a API Express em outro terminal:

```bash
cd ../../expressjs/host-monitor
npm run dev
```

Suba o frontend:

```bash
npm run dev
```

O Vite usa proxy de `/api` para `http://localhost:3000`, entao o frontend fica em `http://localhost:5173` consumindo a API Express local.

Para usar outra URL de API, crie um `.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Rotas

- `/` landing page publica
- `/login` autenticacao
- `/register` cadastro
- `/dashboard` listagem, cadastro e remocao de hosts
- `/hosts/:id` detalhes, ping manual, graficos e historico
