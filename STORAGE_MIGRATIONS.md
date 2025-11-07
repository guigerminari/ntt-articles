# Sistema de Migrations para LocalStorage

## ✅ Correções Implementadas

O sistema agora possui **migrations versionadas** para o LocalStorage, respeitando o banco de dados ativo.

## 🏗️ Arquitetura

```
src/infrastructure/storage/migrations/
├── storage-migration.interface.ts      # Interface para migrations
├── storage-migration.service.ts        # Serviço que gerencia migrations
├── 001-create-initial-structure.ts     # Migration: estrutura inicial
├── 002-seed-permissions.ts             # Migration: seed de permissões
└── 003-seed-root-user.ts               # Migration: seed de usuário root

scripts/
└── storage-migrate.ts                  # CLI para executar migrations

.storage/
├── local-storage.json                  # Dados principais
└── migrations.json                     # Controle de migrations executadas
```

## 📋 Migrations Disponíveis

### 1. CreateInitialStructure (v1)
Cria as coleções vazias: `permissions`, `users`, `articles`

### 2. SeedPermissions (v2)
Insere 3 permissões:
- **Admin** - Full access to manage articles and users
- **Editor** - Can create and edit articles
- **Reader** - Can only read articles

### 3. SeedRootUser (v3)
Cria usuário root:
- Email: `root@ntt.com`
- Password: `admin123`
- Permission: Admin

## 🚀 Como Usar

### Execução Manual

```bash
# Executar migrations pendentes
npm run storage:migrate

# Reverter última migration
npm run storage:rollback
```

### Execução Automática

As migrations são executadas **automaticamente** quando a aplicação inicia (`StorageModule.onModuleInit`).

Apenas migrations que ainda não foram executadas são rodadas.

## 🔍 Controle de Migrations

O arquivo `.storage/migrations.json` controla quais migrations já foram executadas:

```json
{
  "executed": [
    "CreateInitialStructure",
    "SeedPermissions",
    "SeedRootUser"
  ]
}
```

## ➕ Criar Nova Migration

### 1. Criar arquivo da migration

```typescript
// src/infrastructure/storage/migrations/004-add-article-tags.ts
import { IStorageMigration } from './storage-migration.interface';

export class AddArticleTagsMigration implements IStorageMigration {
  name = 'AddArticleTags';
  version = 4;

  async up(storage: any): Promise<void> {
    const articles = storage.getItem('articles') || [];
    
    // Adicionar campo 'tags' em todos os artigos
    const updatedArticles = articles.map(article => ({
      ...article,
      tags: article.tags || [],
    }));
    
    storage.setItem('articles', updatedArticles);
    console.log('   Added tags field to articles');
  }

  async down(storage: any): Promise<void> {
    const articles = storage.getItem('articles') || [];
    
    // Remover campo 'tags'
    const updatedArticles = articles.map(({ tags, ...article }) => article);
    
    storage.setItem('articles', updatedArticles);
    console.log('   Removed tags field from articles');
  }
}
```

### 2. Registrar no StorageModule

```typescript
// src/infrastructure/storage/storage.module.ts
import { AddArticleTagsMigration } from './migrations/004-add-article-tags.ts';

async onModuleInit() {
  this.migrationService.registerMigration(new CreateInitialStructureMigration());
  this.migrationService.registerMigration(new SeedPermissionsMigration());
  this.migrationService.registerMigration(new SeedRootUserMigration());
  this.migrationService.registerMigration(new AddArticleTagsMigration()); // Nova

  await this.migrationService.runPendingMigrations(this.storageService);
}
```

### 3. Executar

```bash
npm run storage:migrate
# ou apenas inicie a aplicação
npm run start:dev
```

## 🔄 Diferenças com TypeORM Migrations

| TypeORM | LocalStorage |
|---------|-------------|
| Tabelas SQL | Coleções JSON |
| `migration:generate` | Criar manualmente |
| `migration:run` | `storage:migrate` |
| `migration:revert` | `storage:rollback` |
| Arquivo `.ts` gerado | Classe implementando `IStorageMigration` |
| Conexão com banco de dados | Arquivo JSON |
| Transações SQL | Leitura/escrita de arquivo |

## ✅ Vantagens

1. **Versionamento** - Controle de quais migrations foram executadas
2. **Rollback** - Reverter migrations com segurança
3. **Automático** - Executa na inicialização da aplicação
4. **Idempotente** - Não executa migrations já aplicadas
5. **Ordenado** - Migrations executadas em ordem de versão
6. **Similar ao TypeORM** - Mesma lógica de `up()` e `down()`

## 🧪 Testes

Todas as 58 testes continuam passando após a implementação das migrations:

```bash
npm test
# Test Suites: 11 passed, 11 total
# Tests: 58 passed, 58 total
```

## 📁 Arquivos Criados/Modificados

### Criados:
- `src/infrastructure/storage/migrations/storage-migration.interface.ts`
- `src/infrastructure/storage/migrations/storage-migration.service.ts`
- `src/infrastructure/storage/migrations/001-create-initial-structure.migration.ts`
- `src/infrastructure/storage/migrations/002-seed-permissions.migration.ts`
- `src/infrastructure/storage/migrations/003-seed-root-user.migration.ts`
- `scripts/storage-migrate.ts`

### Modificados:
- `src/infrastructure/storage/storage.module.ts` - Adicionado `OnModuleInit` e registro de migrations
- `package.json` - Adicionados scripts `storage:migrate` e `storage:rollback`
- `LOCALSTORAGE_DATABASE.md` - Documentação atualizada

## 🎯 Conclusão

O sistema agora possui **migrations versionadas** que respeitam o banco de dados ativo (LocalStorage), funcionando de forma similar ao TypeORM mas adaptado para arquivos JSON.

**Benefícios:**
- ✅ Controle de versão de esquema
- ✅ Seed de dados inicial automatizado
- ✅ Rollback seguro
- ✅ Execução automática na inicialização
- ✅ Sem necessidade de MySQL/PostgreSQL
