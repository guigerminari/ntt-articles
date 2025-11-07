FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependências (incluindo dev dependencies para build)
RUN npm ci

# Copiar código fonte e scripts
COPY src ./src
COPY scripts ./scripts

# Build da aplicação
RUN npm run build

# Criar diretório para storage
RUN mkdir -p .storage

EXPOSE 3000

# Executar migrations e iniciar aplicação
CMD ["sh", "-c", "npm run storage:migrate && npm run start:prod"]
