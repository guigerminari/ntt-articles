# NTT Articles Management System

Sistema de gerenciamento de usuários e artigos com autenticação JWT e controle de permissões desenvolvido com NestJS.

## Funcionalidades

- **Autenticação JWT**: Sistema de login com tokens JWT incluindo nível de permissão
- **Gerenciamento de Usuários**: CRUD completo de usuários (nome, email, senha)
- **Gerenciamento de Artigos**: CRUD completo de artigos (título, conteúdo, autor, categoria)
- **Gerenciamento de Categorias**: CRUD completo de categorias para organização de artigos
- **Controle de Permissões**: Três níveis de acesso (Admin, Editor, Reader)
- **Arquitetura DDD**: Domain-Driven Design com separação de camadas (Domain, Infrastructure, Application)
- **LocalStorage Database**: Sistema de armazenamento em arquivo JSON com migrations versionadas

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
- **Senha**: admin123

## Testando a API com Postman

Uma coleção completa do Postman está disponível no arquivo `ntt-articles.postman_collection.json` na raiz do projeto.

### Importar a Coleção

1. Abra o Postman
2. Clique em **Import** no canto superior esquerdo
3. Selecione o arquivo `ntt-articles.postman_collection.json`
4. A coleção "NTT Articles API" será importada com todas as requisições prontas

### Configuração

A coleção já vem configurada com:
- **base_url**: `http://localhost:3000` (variável de ambiente)
- **jwt_token**: Token JWT (preenchido automaticamente após login)
- **IDs fixos**: Todos os seeds usam IDs fixos para facilitar os testes:
  - **Permissões**:
    - Admin: `00000000-0000-0000-0000-000000000001`
    - Editor: `00000000-0000-0000-0000-000000000002`
    - Reader: `00000000-0000-0000-0000-000000000003`
  - **Usuário Root**: `00000000-0000-0000-0000-000000000010`
  - **Categorias**:
    - Tecnologia: `00000000-0000-0000-0000-000000000020`
    - Negócios: `00000000-0000-0000-0000-000000000021`
    - Geral: `00000000-0000-0000-0000-000000000022`

### Como Usar

1. **Execute o Login**: Vá para `Auth > Login` e execute a requisição
   - O token JWT será salvo automaticamente na variável `jwt_token`
   - Todas as próximas requisições usarão este token automaticamente
2. **Teste os Endpoints**: Navegue pelas pastas (Users, Categories, Articles, Permissions)
3. **Modifique os Exemplos**: Os IDs fixos permitem usar os mesmos valores em todos os ambientes

## Endpoints da API

### Autenticação

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "root@ntt.com",
  "password": "admin123"
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
  "content": "Conteúdo do artigo...",
  "category": "uuid-da-categoria" (opcional)
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

### Categorias

#### Criar Categoria (Admin e Editor)
```
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tecnologia",
  "description": "Artigos sobre tecnologia e inovação"
}
```

#### Listar Todas as Categorias (Todos os usuários autenticados)
```
GET /categories
Authorization: Bearer {token}
```

#### Buscar Categoria por ID (Todos os usuários autenticados)
```
GET /categories/:id
Authorization: Bearer {token}
```

#### Atualizar Categoria (Admin e Editor)
```
PATCH /categories/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Nome",
  "description": "Nova descrição"
}
```

#### Deletar Categoria (Admin e Editor)
```
DELETE /categories/:id
Authorization: Bearer {token}
```

## Estrutura do Projeto

```
ntt-articles/
├── src/
│   ├── articles/              # Módulo de artigos
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── create-article.dto.ts
│   │   │   └── update-article.dto.ts
│   │   ├── entities/          # Entidades TypeORM
│   │   │   └── article.entity.ts
│   │   ├── articles.controller.ts
│   │   ├── articles.service.ts
│   │   └── articles.module.ts
│   ├── auth/                  # Módulo de autenticação
│   │   ├── decorators/        # Decorators customizados
│   │   │   └── permissions.decorator.ts
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   ├── guards/            # Guards de autenticação
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── strategies/        # Estratégias Passport
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── category/              # Módulo de categorias (novo)
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   ├── category.controller.ts
│   │   ├── category.service.ts
│   │   └── category.module.ts
│   ├── config/                # Configurações
│   │   └── typeorm.config.ts
│   ├── database/              # Migrations TypeORM (legado)
│   │   ├── migrations/
│   │   └── seeds/
│   ├── domain/                # Camada de domínio (DDD)
│   │   ├── articles/          # Interfaces de repositório
│   │   │   └── article.repository.interface.ts
│   │   ├── category/
│   │   │   └── category.repository.interface.ts
│   │   ├── permissions/
│   │   │   └── permission.repository.interface.ts
│   │   └── users/
│   │       └── user.repository.interface.ts
│   ├── infrastructure/        # Camada de infraestrutura (DDD)
│   │   ├── persistence/       # Implementações de repositórios
│   │   │   ├── article-storage.repository.ts
│   │   │   ├── article.repository.ts (TypeORM - legado)
│   │   │   ├── category-storage.repository.ts
│   │   │   ├── category.repository.ts (TypeORM - legado)
│   │   │   ├── permission-storage.repository.ts
│   │   │   ├── user-storage.repository.ts
│   │   │   └── user.repository.ts (TypeORM - legado)
│   │   └── storage/           # Sistema de storage
│   │       ├── migrations/    # Migrations do LocalStorage
│   │       │   ├── 001-create-initial-structure.migration.ts
│   │       │   ├── 002-seed-permissions.migration.ts
│   │       │   ├── 003-seed-root-user.migration.ts
│   │       │   ├── 004-seed-categories.migration.ts
│   │       │   ├── storage-migration.interface.ts
│   │       │   └── storage-migration.service.ts
│   │       ├── local-storage.service.ts
│   │       ├── storage.interface.ts
│   │       └── storage.module.ts
│   ├── permissions/           # Módulo de permissões
│   │   ├── entities/
│   │   │   └── permission.entity.ts
│   │   ├── permissions.service.ts
│   │   └── permissions.module.ts
│   ├── users/                 # Módulo de usuários
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.controller.ts      # Controller principal
│   ├── app.module.ts          # Módulo raiz
│   └── main.ts                # Entry point
├── scripts/                   # Scripts utilitários
│   └── storage-migrate.ts     # CLI de migrations do LocalStorage
├── test/                      # Testes unitários
│   ├── articles/
│   │   ├── articles.controller.spec.ts
│   │   └── articles.service.spec.ts
│   ├── auth/
│   │   ├── guards/
│   │   │   └── permissions.guard.spec.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.spec.ts
│   │   │   └── local.strategy.spec.ts
│   │   ├── auth.controller.spec.ts
│   │   └── auth.service.spec.ts
│   ├── category/
│   │   ├── category.controller.spec.ts
│   │   └── category.service.spec.ts
│   ├── permissions/
│   │   └── permissions.service.spec.ts
│   ├── users/
│   │   ├── users.controller.spec.ts
│   │   └── users.service.spec.ts
│   └── app.controller.spec.ts
├── .storage/                  # Dados do LocalStorage (gerado)
│   ├── local-storage.json     # Banco de dados JSON
│   └── migrations.json        # Histórico de migrations
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile                 # Imagem Docker
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── nest-cli.json              # Configuração NestJS CLI
├── jest.config.js             # Configuração Jest
├── .dockerignore              # Arquivos ignorados no Docker
├── API_REFERENCE.md           # Referência completa da API
├── API_TESTING.md             # Guia de testes da API
├── DDD_ARCHITECTURE.md        # Documentação da arquitetura DDD
├── DOCKER_SETUP.md            # Guia de configuração Docker
├── LOCALSTORAGE_DATABASE.md   # Documentação do LocalStorage
├── QUICK_START.md             # Guia rápido de início
├── STORAGE_MIGRATIONS.md      # Documentação de migrations
├── TESTING.md                 # Documentação de testes
└── README.md                  # Este arquivo
```

## Variáveis de Ambiente

As seguintes variáveis de ambiente são configuradas automaticamente no Docker:

```env
NODE_ENV=production
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h
```

**Nota:** O projeto usa LocalStorage (arquivo JSON) como banco de dados padrão, não requerendo configurações de banco de dados externo.

## Desenvolvimento Local

Para desenvolvimento local sem Docker:

### 1. Instale as dependências
```bash
npm install
```

### 2. Execute as migrations do LocalStorage
```bash
npm run storage:migrate
```

Este comando irá:
- Criar a estrutura inicial (`.storage/local-storage.json`)
- Inserir 3 permissões padrão (Admin, Editor, Reader)
- Criar usuário root (root@ntt.com / admin123)
- Criar 3 categorias padrão (Tecnologia, Negócios, Geral)

### 3. Inicie a aplicação em modo desenvolvimento
```bash
npm run start:dev
```

**Vantagens do desenvolvimento local:**
- ✅ Hot reload automático
- ✅ Não precisa de Docker
- ✅ Não precisa de banco de dados externo (MySQL/PostgreSQL)
- ✅ Dados persistem em arquivo JSON
- ✅ Mais rápido que Docker no Windows

### 4. Scripts disponíveis
```bash
# Desenvolvimento com hot reload
npm run start:dev

# Build de produção
npm run build

# Executar em produção
npm run start:prod

# Migrations
npm run storage:migrate      # Executar migrations pendentes
npm run storage:rollback     # Reverter última migration

# Testes
npm test                     # Executar todos os testes
npm run test:cov            # Testes com cobertura
npm run test:watch          # Testes em modo watch
```

Para mais detalhes, consulte [QUICK_START.md](QUICK_START.md).

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js
- **TypeScript**: Linguagem de programação
- **LocalStorage**: Sistema de armazenamento em arquivo JSON (banco de dados principal)
- **TypeORM**: ORM para PostgreSQL (suporte legado)
- **PostgreSQL**: Banco de dados (opcional, não usado por padrão)
- **JWT**: Autenticação baseada em tokens
- **Bcrypt**: Hash de senhas
- **Docker**: Containerização
- **Passport**: Estratégias de autenticação
- **Jest**: Framework de testes
- **DDD**: Domain-Driven Design architecture

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

# Executar testes específicos
npm test -- category
npm test -- articles
npm test -- users
```

### Cobertura de Testes
- **Test Suites**: 13 passed
- **Tests**: 79 passed
- **Coverage**: ~68% de cobertura do código
- **Módulos Testados**: Articles, Auth, Users, Categories, Permissions

Para mais detalhes sobre os testes, consulte [TESTING.md](TESTING.md).

## Documentação Adicional

- **[QUICK_START.md](QUICK_START.md)** - Guia rápido para iniciar o projeto
- **[API_REFERENCE.md](API_REFERENCE.md)** - Referência completa de todos os endpoints
- **[API_TESTING.md](API_TESTING.md)** - Guia de testes da API com exemplos
- **[DDD_ARCHITECTURE.md](DDD_ARCHITECTURE.md)** - Arquitetura Domain-Driven Design
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Guia completo de configuração Docker
- **[LOCALSTORAGE_DATABASE.md](LOCALSTORAGE_DATABASE.md)** - Sistema de banco de dados LocalStorage
- **[STORAGE_MIGRATIONS.md](STORAGE_MIGRATIONS.md)** - Sistema de migrations do LocalStorage
- **[TESTING.md](TESTING.md)** - Documentação completa de testes

## Licença

MIT
