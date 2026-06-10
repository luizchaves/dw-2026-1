FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public
RUN npm run build && npm prune --omit=dev

EXPOSE 3000

CMD ["sh", "-c", "until npx prisma migrate deploy; do sleep 2; done && node dist/src/index.js"]
