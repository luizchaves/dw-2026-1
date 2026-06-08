FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:./src/database/db.sqlite

COPY package*.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public
RUN npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
