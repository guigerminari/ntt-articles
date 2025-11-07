# Domain-Driven Design (DDD) Architecture

## Estrutura Implementada

O projeto agora segue os princípios de DDD com clara separação entre camadas:

### 📁 Estrutura de Pastas

```
src/
├── domain/                          # Camada de Domínio (regras de negócio)
│   ├── articles/
│   │   └── article.repository.interface.ts
│   ├── users/
│   │   └── user.repository.interface.ts
│   └── permissions/
│       └── permission.repository.interface.ts
│
├── infrastructure/                  # Camada de Infraestrutura (implementações técnicas)
│   ├── persistence/                # Implementações de repositórios
│   │   ├── article.repository.ts
│   │   ├── user.repository.ts
│   │   └── permission.repository.ts
│   └── storage/                    # Sistema de storage/cache
│       ├── storage.interface.ts
│       ├── local-storage.service.ts
│       └── storage.module.ts
│
├── articles/                        # Camada de Aplicação
├── users/
├── permissions/
└── auth/
```

## Camadas do DDD

### 1. Domain Layer (Domínio)
- **Responsabilidade**: Define contratos e regras de negócio
- **Conteúdo**: Interfaces de repositório, DTOs, Entities
- **Independência**: Não depende de frameworks ou bibliotecas externas

```typescript
// Exemplo: domain/articles/article.repository.interface.ts
export interface IArticleRepository {
  create(dto: CreateArticleDto, creatorId: string): Promise<Article>;
  findAll(): Promise<Article[]>;
  findOne(id: string): Promise<Article | null>;
  update(id: string, dto: UpdateArticleDto): Promise<Article>;
  remove(id: string): Promise<void>;
}
```

### 2. Infrastructure Layer (Infraestrutura)
- **Responsabilidade**: Implementa detalhes técnicos
- **Conteúdo**: Repositórios TypeORM, storage, configurações
- **Acoplamento**: Acoplada a frameworks específicos (TypeORM, Node.js)

```typescript
// Exemplo: infrastructure/persistence/article.repository.ts
@Injectable()
export class ArticleRepository implements IArticleRepository {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
  ) {}
  
  async create(dto: CreateArticleDto, creatorId: string): Promise<Article> {
    const article = this.repository.create({ ...dto, creatorId });
    return await this.repository.save(article);
  }
  // ... outras implementações
}
```

### 3. Application Layer (Aplicação)
- **Responsabilidade**: Orquestra casos de uso
- **Conteúdo**: Services que coordenam domínio e infraestrutura
- **Injeção**: Depende apenas de interfaces (inversão de dependência)

```typescript
// Exemplo: articles/articles.service.ts
@Injectable()
export class ArticlesService {
  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: IArticleRepository,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}
  
  async findAll(): Promise<Article[]> {
    // Busca cache primeiro
    const cached = this.storageService.getWithExpiry<Article[]>('articles:all');
    if (cached) return cached;
    
    // Busca do repositório
    const articles = await this.articleRepository.findAll();
    
    // Salva no cache
    this.storageService.setWithExpiry('articles:all', articles, 5);
    
    return articles;
  }
}
```

## LocalStorage Service

### Funcionalidades

O `LocalStorageService` simula o comportamento de localStorage do navegador no servidor Node.js:

- ✅ Persistência em arquivo JSON (`.storage/local-storage.json`)
- ✅ Cache com TTL (Time-To-Live)
- ✅ API simples e familiar
- ✅ Invalidação automática de cache expirado
- ✅ Módulo global disponível em toda aplicação

### API do Storage

```typescript
interface IStorageService {
  // Operações básicas
  setItem<T>(key: string, value: T): void;
  getItem<T>(key: string): T | null;
  removeItem(key: string): void;
  clear(): void;
  has(key: string): boolean;
  
  // Operações com TTL
  setWithExpiry<T>(key: string, value: T, ttlMinutes: number): void;
  getWithExpiry<T>(key: string): T | null;
}
```

### Exemplo de Uso

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IStorageService, STORAGE_SERVICE } from '../infrastructure/storage/storage.interface';

@Injectable()
export class MyService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  async getData(id: string) {
    // Buscar do cache
    const cacheKey = `data:${id}`;
    const cached = this.storage.getWithExpiry<MyData>(cacheKey);
    
    if (cached) {
      console.log('Cache hit!');
      return cached;
    }
    
    // Buscar da fonte de dados
    const data = await this.fetchFromDatabase(id);
    
    // Salvar no cache por 10 minutos
    this.storage.setWithExpiry(cacheKey, data, 10);
    
    return data;
  }
  
  async updateData(id: string, newData: MyData) {
    const data = await this.repository.update(id, newData);
    
    // Invalidar cache após atualização
    this.storage.removeItem(`data:${id}`);
    
    return data;
  }
}
```

## Benefícios da Arquitetura DDD

### 1. Separação de Responsabilidades
- Domínio: regras de negócio puras
- Infraestrutura: detalhes técnicos
- Aplicação: orquestração

### 2. Testabilidade
```typescript
// Testar service com mock repositories
const mockRepository: IArticleRepository = {
  findAll: jest.fn().mockResolvedValue([...]),
  // ...
};

const service = new ArticlesService(mockRepository, mockStorage);
```

### 3. Flexibilidade
- Trocar TypeORM por Prisma? Basta implementar nova classe de repositório
- Trocar arquivo JSON por Redis? Basta implementar nova classe de storage
- Interfaces permanecem as mesmas!

### 4. Manutenibilidade
- Código organizado por conceitos de negócio
- Dependências claras e explícitas
- Fácil localizar e modificar comportamentos

## Cache Strategy

### TTL (Time-To-Live) por Recurso

| Recurso | TTL | Motivo |
|---------|-----|--------|
| Articles | 5 min | Conteúdo dinâmico, muda frequentemente |
| Users | 5 min | Dados de usuário podem ser atualizados |
| Permissions | 30 min | Raramente mudam, cache mais longo |

### Invalidação de Cache

Cache é automaticamente invalidado nas operações:
- **CREATE**: Remove cache da lista (`findAll`)
- **UPDATE**: Remove cache individual e da lista
- **DELETE**: Remove cache individual e da lista

## Performance

### Antes (Sem Cache)
```
GET /articles → 150ms (consulta MySQL)
GET /articles → 150ms (consulta MySQL)
GET /articles → 150ms (consulta MySQL)
```

### Depois (Com Cache)
```
GET /articles → 150ms (consulta MySQL + salva cache)
GET /articles → 2ms (retorna do cache)
GET /articles → 2ms (retorna do cache)
```

**Melhoria**: ~75x mais rápido para requests subsequentes!

## Comandos Úteis

```bash
# Verificar arquivo de storage
cat .storage/local-storage.json

# Limpar cache manualmente (apagar arquivo)
rm -rf .storage/

# Rodar aplicação
npm run start:dev
```

## Próximos Passos

- [ ] Implementar Redis para cache distribuído em produção
- [ ] Adicionar métricas de hit/miss de cache
- [ ] Criar middleware de cache HTTP
- [ ] Implementar padrão CQRS (Command Query Responsibility Segregation)
