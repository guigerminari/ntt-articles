# Quick Start - NTT Articles

## ⚠️ Pré-requisitos

### Iniciar o Docker Desktop

**IMPORTANTE:** Antes de executar qualquer comando, certifique-se de que o Docker Desktop está rodando:

1. **Abra o Docker Desktop**
   - Procure por "Docker Desktop" no menu Iniciar do Windows
   - Aguarde até o ícone ficar verde na bandeja do sistema (1-2 minutos)

2. **Verifique se está funcionando:**
   ```powershell
   docker --version
   docker ps
   ```
   
   Se aparecer "error during connect", o Docker não está rodando. Volte ao passo 1.

3. **Se o Docker não estiver instalado:**
   - Baixe em: https://www.docker.com/products/docker-desktop
   - Instale e reinicie o computador
   - Habilite WSL 2 durante a instalação

---

## Iniciar o Projeto

### 1. Com Docker (Método Recomendado)

```powershell
# Subir a aplicação
docker compose up --build

# A aplicação estará disponível em http://localhost:3000
# Os dados ficam armazenados em .storage/local-storage.json
```

**O que acontece:**
- ✅ Compila a aplicação Node.js
- ✅ Executa migrations do LocalStorage automaticamente
- ✅ Cria 3 permissões (Admin, Editor, Reader)
- ✅ Cria usuário root (root@ntt.com / admin123)
- ✅ Inicia o servidor na porta 3000

### 2. Parar o Projeto

```powershell
# Pressione Ctrl+C no terminal
# Ou execute:
docker compose down

# Para remover também os volumes (banco de dados):
docker compose down -v
```

## Teste Rápido

### 1. Fazer Login

```powershell
# PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"root@ntt.com","password":"admin123"}'

$token = $response.access_token
Write-Host "Token: $token"
```

### 2. Criar um Artigo

```powershell
# PowerShell (use o token obtido acima)
Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Meu Artigo","content":"Conteúdo do artigo"}'
```

### 3. Listar Artigos

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}
```

## Verificar Logs

```powershell
# Ver logs da aplicação
docker logs ntt-articles-app

# Seguir logs em tempo real
docker logs -f ntt-articles-app
```

## Ver Dados do LocalStorage

### Com Docker
```powershell
# Ver dados do banco de dados JSON
Get-Content .storage/local-storage.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Ver migrations executadas
Get-Content .storage/migrations.json

# Entrar no container e ver os dados
docker exec -it ntt-articles-app cat .storage/local-storage.json
```

### Sem Docker (Node Local)
```powershell
# Ver todos os dados formatados
Get-Content .storage/local-storage.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Ver apenas usuários
$data = Get-Content .storage/local-storage.json | ConvertFrom-Json
$data.users | ForEach-Object { 
  Write-Host "👤 $($_.name) - $($_.email)" -ForegroundColor Cyan 
}

# Ver apenas artigos
$data.articles | ForEach-Object { 
  Write-Host "📄 $($_.title)" -ForegroundColor Yellow 
  Write-Host "   Criado em: $($_.createdAt)" -ForegroundColor Gray
}

# Ver permissões
$data.permissions | ForEach-Object { 
  Write-Host "🔐 $($_.name) - $($_.description)" -ForegroundColor Magenta 
}

# Ver histórico de migrations
Get-Content .storage/migrations.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Desenvolvimento Local (Sem Docker)

Se preferir rodar localmente sem Docker:

```powershell
# 1. Instale as dependências
npm install

# 2. Execute as migrations do LocalStorage
npm run storage:migrate

# 3. Inicie a aplicação em modo desenvolvimento
npm run start:dev
```

**Vantagens:**
- ✅ Não precisa de Docker
- ✅ Não precisa de MySQL/PostgreSQL
- ✅ Hot reload automático com `--watch`
- ✅ Dados persistem em `.storage/local-storage.json`

### Testar Rotas com Node Local

Com a aplicação rodando localmente (`npm run start:dev`), use estes comandos em **outro terminal**:

#### 1. Fazer Login
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"root@ntt.com","password":"admin123"}'

$token = $response.access_token
Write-Host "✅ Login successful! Token: $($token.Substring(0,50))..."
```

#### 2. Criar um Artigo
```powershell
# Use o token obtido acima
$article = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Meu Primeiro Artigo","content":"Conteúdo do meu artigo de teste"}'

Write-Host "✅ Artigo criado! ID: $($article.id)"
```

#### 3. Listar Todos os Artigos
```powershell
$articles = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

Write-Host "📚 Total de artigos: $($articles.Count)"
$articles | ForEach-Object { Write-Host "  - $($_.title)" }
```

#### 4. Buscar um Artigo Específico
```powershell
# Substitua $article.id pelo ID do artigo que você quer buscar
$singleArticle = Invoke-RestMethod -Uri "http://localhost:3000/articles/$($article.id)" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

Write-Host "📄 Artigo: $($singleArticle.title)"
Write-Host "Conteúdo: $($singleArticle.content)"
```

#### 5. Atualizar um Artigo
```powershell
$updated = Invoke-RestMethod -Uri "http://localhost:3000/articles/$($article.id)" `
  -Method PATCH `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Título Atualizado","content":"Novo conteúdo"}'

Write-Host "✅ Artigo atualizado!"
```

#### 6. Deletar um Artigo
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/articles/$($article.id)" `
  -Method DELETE `
  -Headers @{Authorization="Bearer $token"}

Write-Host "🗑️ Artigo deletado!"
```

#### 7. Criar um Novo Usuário
```powershell
$newUser = Invoke-RestMethod -Uri "http://localhost:3000/users" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"name":"João Silva","email":"joao@example.com","password":"senha123","permissionId":"<PERMISSION_ID>"}'

Write-Host "✅ Usuário criado! ID: $($newUser.id)"
```

**Dica:** Para obter o `permissionId`, liste as permissões:
```powershell
# Ver permissões disponíveis
$data = Get-Content .storage/local-storage.json | ConvertFrom-Json
$data.permissions | ForEach-Object { Write-Host "$($_.id) - $($_.name)" }
```

#### 8. Listar Todos os Usuários
```powershell
$users = Invoke-RestMethod -Uri "http://localhost:3000/users" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

Write-Host "👥 Total de usuários: $($users.Count)"
$users | ForEach-Object { Write-Host "  - $($_.name) ($($_.email))" }
```

#### Script Completo de Teste
```powershell
# Execute tudo de uma vez
Write-Host "`n🚀 Iniciando testes da API...`n" -ForegroundColor Green

# 1. Login
Write-Host "1️⃣ Fazendo login..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"root@ntt.com","password":"admin123"}'
$token = $response.access_token
Write-Host "   ✅ Login bem-sucedido!`n"

# 2. Criar artigo
Write-Host "2️⃣ Criando artigo..." -ForegroundColor Cyan
$article = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Artigo de Teste","content":"Este é um artigo criado automaticamente"}'
Write-Host "   ✅ Artigo criado: $($article.title)`n"

# 3. Listar artigos
Write-Host "3️⃣ Listando artigos..." -ForegroundColor Cyan
$articles = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}
Write-Host "   ✅ Encontrados $($articles.Count) artigo(s)`n"

# 4. Atualizar artigo
Write-Host "4️⃣ Atualizando artigo..." -ForegroundColor Cyan
$updated = Invoke-RestMethod -Uri "http://localhost:3000/articles/$($article.id)" `
  -Method PATCH `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Artigo Atualizado"}'
Write-Host "   ✅ Artigo atualizado!`n"

# 5. Deletar artigo
Write-Host "5️⃣ Deletando artigo..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/articles/$($article.id)" `
  -Method DELETE `
  -Headers @{Authorization="Bearer $token"}
Write-Host "   ✅ Artigo deletado!`n"

Write-Host "🎉 Todos os testes completados com sucesso!" -ForegroundColor Green
```

## Comandos Úteis

```powershell
# Reinstalar do zero (limpa dados)
docker compose down -v
docker compose up --build

# Ver containers rodando
docker ps

# Ver logs de erro específicos
docker logs ntt-articles-app --tail 50

# Entrar no container da aplicação
docker exec -it ntt-articles-app sh

# Executar migrations manualmente dentro do container
docker exec ntt-articles-app npm run storage:migrate

# Ver dados do storage
docker exec ntt-articles-app cat .storage/local-storage.json

# Copiar dados do container para o host
docker cp ntt-articles-app:/app/.storage ./backup-storage
```

## Troubleshooting

### Docker Desktop não está rodando
```
Erro: "error during connect: this error may indicate that the docker daemon is not running"
```

**Solução:**
1. **Inicie o Docker Desktop**
   - Procure por "Docker Desktop" no menu Iniciar do Windows
   - Abra o aplicativo
   - Aguarde até que o ícone do Docker na bandeja do sistema fique verde
   - Isso pode levar 1-2 minutos

2. **Verifique se o Docker está funcionando:**
   ```powershell
   docker --version
   docker ps
   ```

3. **Se o Docker Desktop não estiver instalado:**
   - Baixe em: https://www.docker.com/products/docker-desktop
   - Instale e reinicie o computador
   - Certifique-se de habilitar WSL 2 durante a instalação

4. **Após o Docker Desktop iniciar:**
   ```powershell
   docker compose up --build
   ```

### Porta 3000 já está em uso
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Ou edite o docker-compose.yml e mude para outra porta:
# ports:
#   - "3001:3000"
```

### Porta 5432 já está em uso
**Não se aplica mais** - o projeto agora usa LocalStorage (arquivo JSON) em vez de MySQL/PostgreSQL.

### Dados não persistem entre restarts
```powershell
# Verifique se o volume está montado corretamente
docker inspect ntt-articles-app | findstr -i "mounts"

# Os dados devem estar em .storage/ no host
dir .storage
```

### Recriar tudo do zero
```powershell
# Pare e remova tudo
docker compose down -v

# Remova as imagens
docker rmi ntt-articles-app

# Limpe volumes órfãos
docker volume prune

# Suba novamente
docker compose up --build
```

## URLs Importantes

- **API**: http://localhost:3000
- **Login**: POST http://localhost:3000/auth/login
- **Artigos**: GET http://localhost:3000/articles
- **Usuários**: GET http://localhost:3000/users

## Credenciais Padrão

- **Email**: root@ntt.com
- **Senha**: admin123
- **Permissão**: Admin

## Banco de Dados

O projeto usa **LocalStorage** (arquivo JSON) em vez de MySQL/PostgreSQL:
- **Localização**: `.storage/local-storage.json`
- **Migrations**: `.storage/migrations.json`
- **Vantagens**: Sem dependências externas, fácil de versionar, portável

## Documentação Completa

- `README.md` - Documentação geral do projeto
- `API_TESTING.md` - Guia completo de testes da API
- `PROJECT_SUMMARY.md` - Resumo completo do projeto

---

**Pronto!** Seu sistema de gerenciamento de artigos está funcionando! 🚀
