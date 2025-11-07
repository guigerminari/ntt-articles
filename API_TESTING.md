# API Testing Guide

## Testing com cURL

### 1. Login (obter token)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"root@ntt.com\",\"password\":\"rootpassword\"}"
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Root User",
    "email": "root@ntt.com",
    "permission": "Admin"
  }
}
```

**Importante**: Copie o `access_token` para usar nos próximos comandos.

### 2. Criar um novo usuário (Admin apenas)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"name\":\"João Silva\",\"email\":\"joao@example.com\",\"password\":\"senha123\",\"permissionId\":\"ID_DA_PERMISSAO\"}"
```

Para obter o ID da permissão, você pode criar um endpoint ou usar o banco diretamente. As permissões são:
- Admin
- Editor
- Reader

### 3. Listar todos os usuários
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Buscar usuário específico
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Atualizar usuário
```bash
curl -X PATCH http://localhost:3000/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"name\":\"João Silva Atualizado\"}"
```

### 6. Criar artigo
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"title\":\"Meu Primeiro Artigo\",\"content\":\"Este é o conteúdo do meu artigo...\"}"
```

### 7. Listar todos os artigos
```bash
curl -X GET http://localhost:3000/articles \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 8. Buscar artigo específico
```bash
curl -X GET http://localhost:3000/articles/ARTICLE_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 9. Atualizar artigo
```bash
curl -X PATCH http://localhost:3000/articles/ARTICLE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"title\":\"Título Atualizado\",\"content\":\"Conteúdo atualizado...\"}"
```

### 10. Deletar artigo
```bash
curl -X DELETE http://localhost:3000/articles/ARTICLE_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 11. Deletar usuário
```bash
curl -X DELETE http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Testing com Postman

### 1. Configurar Collection

1. Crie uma nova Collection chamada "NTT Articles"
2. Adicione uma variável de ambiente `baseUrl` com valor `http://localhost:3000`
3. Adicione uma variável de ambiente `token` (será preenchida após login)

### 2. Configurar Auth automático

Após fazer login, no script de Test da request de login:
```javascript
const response = pm.response.json();
pm.environment.set("token", response.access_token);
```

### 3. Nas outras requests

Em Authorization, selecione "Bearer Token" e use `{{token}}`

## Testing com Thunder Client (VS Code)

1. Instale a extensão Thunder Client
2. Crie uma nova request
3. Configure a URL: `http://localhost:3000/auth/login`
4. Método: POST
5. Body (JSON):
```json
{
  "email": "root@ntt.com",
  "password": "rootpassword"
}
```
6. Envie e copie o token
7. Para outras requests, adicione header:
   - Key: `Authorization`
   - Value: `Bearer {seu_token}`

## Testando Permissões

### Como Reader (apenas leitura de artigos):
1. Faça login com um usuário Reader
2. Tente criar artigo → Deve falhar (403 Forbidden)
3. Tente listar artigos → Deve funcionar (200 OK)
4. Tente editar artigo → Deve falhar (403 Forbidden)
5. Tente deletar artigo → Deve falhar (403 Forbidden)
6. Tente listar usuários → Deve falhar (403 Forbidden)

### Como Editor (gerenciar artigos):
1. Faça login com um usuário Editor
2. Tente criar artigo → Deve funcionar (201 Created)
3. Tente listar artigos → Deve funcionar (200 OK)
4. Tente editar artigo → Deve funcionar (200 OK)
5. Tente deletar artigo → Deve funcionar (200 OK)
6. Tente listar usuários → Deve falhar (403 Forbidden)

### Como Admin (gerenciar tudo):
1. Faça login com um usuário Admin
2. Todas as operações devem funcionar

## Verificando o Banco de Dados

```bash
# Conectar ao container do PostgreSQL
docker exec -it ntt-articles-db psql -U postgres -d ntt_articles

# Listar permissões
SELECT * FROM permissions;

# Listar usuários
SELECT id, name, email, "permissionId" FROM users;

# Listar artigos
SELECT id, title, "creatorId" FROM articles;

# Sair
\q
```

## Códigos de Status HTTP

- 200: OK (Sucesso)
- 201: Created (Criado com sucesso)
- 400: Bad Request (Dados inválidos)
- 401: Unauthorized (Não autenticado)
- 403: Forbidden (Não autorizado - sem permissão)
- 404: Not Found (Recurso não encontrado)
- 409: Conflict (Conflito - ex: email já existe)
