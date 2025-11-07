# LocalStorage como Banco de Dados Principal

## 🎯 Visão Geral

O sistema agora usa **LocalStorage (arquivo JSON)** como banco de dados principal ao invés de MySQL. Isso torna a aplicação completamente **serverless** e **sem dependências externas**.

## 📁 Estrutura de Dados

Os dados são armazenados em: `.storage/local-storage.json`

```json
{
  "permissions": [...],
  "users": [...],
  "articles": [...]
}
```

## 🚀 Início Rápido

### 1. Executar Migrations do LocalStorage

```bash
npm run storage:migrate
```

Isso executa 3 migrations:
1. **CreateInitialStructure** - Cria as coleções (permissions, users, articles)
2. **SeedPermissions** - Insere 3 permissões (Admin, Editor, Reader)
3. **SeedRootUser** - Cria usuário root

**Credenciais padrão:**
- Email: `root@ntt.com`
- Password: `admin123`
- Permission: `Admin`

> **Nota:** As migrations são executadas **automaticamente** quando a aplicação inicia pela primeira vez!

### 2. Iniciar a Aplicação

```bash
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

### 3. Fazer Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@ntt.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Root Admin",
    "email": "root@ntt.com",
    "permission": {
      "name": "Admin",
      "description": "Full access to manage articles and users"
    }
  }
}
```

## 🏗️ Arquitetura DDD com LocalStorage

### Camadas Implementadas

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (ArticlesService, UsersService)        │
└──────────────┬──────────────────────────┘
               │
               │ Depend on interfaces
               ↓
┌─────────────────────────────────────────┐
│          Domain Layer                   │
│  (IArticleRepository, IUserRepository)  │
└──────────────┬──────────────────────────┘
               │
               │ Implemented by
               ↓
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│  (ArticleStorageRepository, etc.)       │
│  Uses: LocalStorageService              │
└─────────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    .storage/local-storage.json          │
└─────────────────────────────────────────┘
```

### Repositórios de Storage

**ArticleStorageRepository** (`article-storage.repository.ts`)
- CRUD completo usando LocalStorage
- Gera UUID automaticamente
- Timestamps automáticos (createdAt, updatedAt)

**UserStorageRepository** (`user-storage.repository.ts`)
- Hash de senha com bcrypt
- Validação de email único
- Suporte a relações com Permission

**PermissionStorageRepository** (`permission-storage.repository.ts`)
- Leitura de permissões
- Cache de longa duração (30min)

## 💾 Persistência de Dados

### Como Funciona

O `LocalStorageService` persiste dados em arquivo JSON:

```typescript
// Salvando dados
storage.setItem('users', usersArray);

// Lendo dados
const users = storage.getItem<User[]>('users');

// Cache com TTL
storage.setWithExpiry('cache-key', data, 5); // 5 minutos
```

### Arquivo de Dados

```json
{
  "permissions": [
    {
      "id": "uuid-1",
      "name": "Admin",
      "description": "Full access to manage articles and users",
      "createdAt": "2025-11-05T23:13:28.000Z",
      "updatedAt": "2025-11-05T23:13:28.000Z"
    }
  ],
  "users": [
    {
      "id": "uuid-2",
      "name": "Root Admin",
      "email": "root@ntt.com",
      "password": "$2b$10$hashedpassword...",
      "permissionId": "uuid-1",
      "createdAt": "2025-11-05T23:13:28.000Z",
      "updatedAt": "2025-11-05T23:13:28.000Z"
    }
  ],
  "articles": []
}
```

## 🔄 Operações CRUD

### Criar Artigo

```bash
curl -X POST http://localhost:3000/articles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Primeiro Artigo",
    "content": "Conteúdo do artigo..."
  }'
```

### Listar Artigos

```bash
curl http://localhost:3000/articles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Criar Usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Editor",
    "email": "editor@ntt.com",
    "password": "senha123",
    "permissionId": "UUID_DA_PERMISSAO_EDITOR"
  }'
```

## 🎯 Vantagens do LocalStorage

### ✅ Sem Dependências Externas
- Não precisa instalar MySQL, PostgreSQL, etc.
- Funciona offline
- Zero configuração de banco de dados

### ✅ Desenvolvimento Rápido
- Inicialização instantânea (`npm run storage:init`)
- Não precisa rodar migrations
- Fácil de resetar (deletar `.storage/`)

### ✅ Portabilidade
- Arquivo `.storage/local-storage.json` pode ser versionado
- Fácil de compartilhar entre desenvolvedores
- Deploy simples (basta copiar o arquivo)

### ✅ Arquitetura Limpa (DDD)
- Interfaces de repositório preservadas
- Fácil trocar para banco real depois
- Separação clara de responsabilidades

## 🔧 Comandos Úteis

```bash
# Executar migrations pendentes
npm run storage:migrate

# Reverter última migration
npm run storage:rollback

# Ver dados atuais
cat .storage/local-storage.json

# Ver status das migrations
cat .storage/migrations.json

# Resetar banco de dados completamente
rm -rf .storage/
npm run storage:migrate

# Rodar testes
npm test

# Compilar aplicação
npm run build

# Rodar em produção
npm run start:prod
```

## 📝 Sistema de Migrations

### Como Funciona

O sistema de migrations do LocalStorage é similar ao TypeORM, mas adaptado para arquivos JSON:

**Controle de Migrations:** `.storage/migrations.json`
```json
{
  "executed": [
    "CreateInitialStructure",
    "SeedPermissions",
    "SeedRootUser"
  ]
}
```

### Criar Nova Migration

```typescript
// src/infrastructure/storage/migrations/004-my-migration.ts
import { IStorageMigration } from './storage-migration.interface';

export class MyMigration implements IStorageMigration {
  name = 'MyMigration';
  version = 4;

  async up(storage: any): Promise<void> {
    // Código para aplicar a migration
    const users = storage.getItem('users') || [];
    // ... modificações
    storage.setItem('users', users);
  }

  async down(storage: any): Promise<void> {
    // Código para reverter a migration
  }
}
```

### Registrar Migration

Adicione no `storage.module.ts`:

```typescript
this.migrationService.registerMigration(new MyMigration());
```

### Execução Automática

As migrations são executadas **automaticamente** quando a aplicação inicia (`onModuleInit`). Apenas migrations pendentes são executadas.

## 🚨 Limitações

### Concorrência
- Não suporta múltiplas instâncias da aplicação
- Writes não são atômicos
- Sem locks de transação

### Performance
- Leitura/escrita de todo o arquivo a cada operação
- Não otimizado para grandes volumes de dados
- Sem índices ou otimizações de consulta

### Produção
- **Não recomendado para produção**
- Use para desenvolvimento, protótipos, demos
- Para produção, use MySQL/PostgreSQL (já implementado)

## 🔄 Voltar para MySQL

Para voltar a usar MySQL, basta trocar nos módulos:

```typescript
// De:
useClass: ArticleStorageRepository

// Para:
useClass: ArticleRepository
```

E reativar o TypeORM no `app.module.ts`.

## 📊 Monitoramento

Os dados são salvos automaticamente após cada operação. Para monitorar:

```bash
# Watch do arquivo de dados (Linux/Mac)
watch -n 1 cat .storage/local-storage.json

# PowerShell (Windows)
while($true) { Clear-Host; Get-Content .storage/local-storage.json | ConvertFrom-Json | ConvertTo-Json -Depth 10; Start-Sleep 1 }
```

### Arquivos do Sistema

```
.storage/
├── local-storage.json    # Dados principais (permissions, users, articles)
└── migrations.json       # Controle de migrations executadas
```

## 🔄 Migrar Entre Bancos de Dados

### De LocalStorage para MySQL

1. Configure o MySQL no `.env`:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=ntt_articles
```

2. Atualize os módulos para usar repositórios TypeORM:
```typescript
// articles.module.ts
{
  provide: ARTICLE_REPOSITORY,
  useClass: ArticleRepository, // Em vez de ArticleStorageRepository
}
```

3. Execute migrations TypeORM:
```bash
npm run migration:run
npm run seed
```

### De MySQL para LocalStorage

1. Exporte dados do MySQL
2. Formate para JSON e salve em `.storage/local-storage.json`
3. Use `ArticleStorageRepository`, `UserStorageRepository`, etc.
4. Execute: `npm run storage:migrate`

## 🎉 Pronto!

Agora você tem um sistema completo de gerenciamento de artigos usando apenas arquivos JSON como banco de dados!

**Teste a API:**
1. `npm run storage:init` - Inicializar dados
2. `npm run start:dev` - Iniciar servidor
3. Fazer login com `root@ntt.com` / `admin123`
4. Criar artigos e usuários via API REST
5. Ver os dados em `.storage/local-storage.json`
