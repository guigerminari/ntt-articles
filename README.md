# NTT Articles Management System

Sistema de gerenciamento de usuários e artigos com autenticação JWT e controle de permissões desenvolvido com NestJS.

## Funcionalidades

- **Autenticação JWT**: Sistema de login com tokens JWT incluindo nível de permissão
- **Gerenciamento de Usuários**: CRUD completo de usuários (nome, email, senha)
- **Gerenciamento de Artigos**: CRUD completo de artigos (título, conteúdo, autor)
- **Controle de Permissões**: Três níveis de acesso (Admin, Editor, Reader)

## Níveis de Permissão

### Admin
- Permissão total para administrar artigos e usuários
- Ações: Criar, Ler, Editar e Apagar artigos e usuários

### Editor
- Permissão para administrar artigos
- Ações: Criar, Ler, Editar e Apagar artigos

### Reader
- Permissão apenas para leitura
- Ações: Ler artigos

## Requisitos

- **Docker Desktop** (obrigatório)
- Node.js 18+ (opcional, apenas para desenvolvimento local)

## Instalação e Execução

### ⚠️ Antes de começar: Docker Desktop

**IMPORTANTE:** Certifique-se de que o Docker Desktop está instalado e rodando:

1. Se não tiver o Docker instalado: [Baixe aqui](https://www.docker.com/products/docker-desktop)
2. Abra o Docker Desktop e aguarde o ícone ficar verde
3. Verifique: `docker --version`

**Problemas com Docker?** Veja o guia completo: [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### 1. Clone o repositório
```bash
git clone https://github.com/guigerminari/ntt-articles.git
cd ntt-articles
```

### 2. Inicie o projeto com Docker
```bash
docker compose up --build
```

Este comando irá:
- Compilar a aplicação Node.js
- Executar migrations do LocalStorage (arquivo JSON)
- Criar 3 permissões (Admin, Editor, Reader)
- Criar usuário root via seed
- Iniciar a aplicação na porta 3000

**Banco de dados:** LocalStorage (`.storage/local-storage.json`) - sem necessidade de MySQL/PostgreSQL

### 3. Acesso

A aplicação estará disponível em: `http://localhost:3000`

## Usuário Root (Padrão)

Um usuário administrador é criado automaticamente:
- **Email**: root@ntt.com
- **Senha**: rootpassword

## Endpoints da API

### Autenticação

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "root@ntt.com",
  "password": "rootpassword"
}

Response:
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "Root User",
    "email": "root@ntt.com",
    "permission": "Admin"
  }
}
```

### Usuários (Apenas Admin)

#### Criar Usuário
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nome do Usuário",
  "email": "usuario@example.com",
  "password": "senha123",
  "permissionId": "uuid-da-permissao"
}
```

#### Listar Todos os Usuários
```
GET /users
Authorization: Bearer {token}
```

#### Buscar Usuário por ID
```
GET /users/:id
Authorization: Bearer {token}
```

#### Atualizar Usuário
```
PATCH /users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "email": "novoemail@example.com"
}
```

#### Deletar Usuário
```
DELETE /users/:id
Authorization: Bearer {token}
```

### Artigos

#### Criar Artigo (Admin e Editor)
```
POST /articles
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Título do Artigo",
  "content": "Conteúdo do artigo..."
}
```

#### Listar Todos os Artigos (Todos os usuários autenticados)
```
GET /articles
Authorization: Bearer {token}
```

#### Buscar Artigo por ID (Todos os usuários autenticados)
```
GET /articles/:id
Authorization: Bearer {token}
```

#### Atualizar Artigo (Admin e Editor)
```
PATCH /articles/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Novo Título",
  "content": "Novo conteúdo..."
}
```

#### Deletar Artigo (Admin e Editor)
```
DELETE /articles/:id
Authorization: Bearer {token}
```

## Estrutura do Projeto

```
ntt-articles/
├── src/
│   ├── articles/           # Módulo de artigos
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── articles.controller.ts
│   │   ├── articles.service.ts
│   │   └── articles.module.ts
│   ├── auth/               # Módulo de autenticação
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── config/             # Configurações
│   │   └── typeorm.config.ts
│   ├── database/           # Migrations e seeds
│   │   ├── migrations/
│   │   └── seeds/
│   ├── permissions/        # Módulo de permissões
│   │   ├── entities/
│   │   ├── permissions.service.ts
│   │   └── permissions.module.ts
│   ├── users/             # Módulo de usuários
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## Variáveis de Ambiente

As seguintes variáveis de ambiente são configuradas automaticamente no Docker:

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ntt_articles
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h
```

## Desenvolvimento Local

Para desenvolvimento local sem Docker:

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`

3. Instale as dependências:
```bash
npm install
```

4. Execute as migrations:
```bash
npm run migration:run
```

5. Execute os seeds:
```bash
npm run seed
```

6. Inicie a aplicação:
```bash
npm run start:dev
```

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js
- **TypeScript**: Linguagem de programação
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Banco de dados
- **JWT**: Autenticação baseada em tokens
- **Bcrypt**: Hash de senhas
- **Docker**: Containerização
- **Passport**: Estratégias de autenticação
- **Jest**: Framework de testes

## Testes

O projeto possui uma suíte completa de testes unitários.

### Executar testes
```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:cov

# Executar em modo watch
npm run test:watch
```

### Cobertura de Testes
- **Test Suites**: 11 passed
- **Tests**: 61 passed
- **Coverage**: ~94% de cobertura do código

Para mais detalhes sobre os testes, consulte [TESTING.md](TESTING.md).

## Licença

MIT
