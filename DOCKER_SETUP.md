# Guia: Configurar e Iniciar o Docker

## 📋 Passo a Passo

### 1️⃣ Verificar se o Docker está instalado

```powershell
docker --version
```

**Se aparecer a versão:** Docker está instalado ✅  
**Se aparecer erro:** Vá para o passo 2 ⬇️

---

### 2️⃣ Instalar Docker Desktop (se necessário)

1. **Baixar Docker Desktop:**
   - Acesse: https://www.docker.com/products/docker-desktop
   - Clique em "Download for Windows"

2. **Instalar:**
   - Execute o instalador baixado
   - **IMPORTANTE:** Marque a opção "Use WSL 2 instead of Hyper-V"
   - Siga o assistente de instalação
   - Reinicie o computador quando solicitado

3. **Após reiniciar:**
   - O Docker Desktop deve iniciar automaticamente
   - Se não iniciar, procure "Docker Desktop" no menu Iniciar

---

### 3️⃣ Iniciar o Docker Desktop

1. **Abrir o aplicativo:**
   - Procure por "Docker Desktop" no menu Iniciar do Windows
   - Clique para abrir

2. **Aguardar inicialização:**
   - O ícone do Docker aparecerá na bandeja do sistema (próximo ao relógio)
   - Inicialmente o ícone ficará animado/laranja
   - **Aguarde até ficar verde** (pode levar 1-2 minutos)
   
3. **Verificar status:**
   ```powershell
   docker ps
   ```
   
   Se funcionar sem erro, o Docker está rodando! ✅

---

### 4️⃣ Iniciar o Projeto NTT Articles

**Agora sim, com o Docker rodando:**

```powershell
# Navegue até a pasta do projeto
cd C:\Users\Guilherme\Documents\dev\ntt\ntt-articles

# Compile e inicie os containers
docker compose up --build
```

**Aguarde até ver:**
```
ntt-articles-app  | 🔄 Running LocalStorage migrations...
ntt-articles-app  | ✅ Migration CreateInitialStructure completed
ntt-articles-app  | ✅ Migration SeedPermissions completed
ntt-articles-app  | ✅ Migration SeedRootUser completed
ntt-articles-app  | Nest application successfully started
```

**Pronto!** A API está rodando em: http://localhost:3000

---

## 🔧 Solução de Problemas Comuns

### Erro: "docker daemon is not running"

**Causa:** Docker Desktop não está iniciado

**Solução:**
1. Abra o Docker Desktop (menu Iniciar)
2. Aguarde o ícone ficar verde na bandeja do sistema
3. Tente novamente: `docker compose up --build`

---

### Erro: "port 3000 is already in use"

**Causa:** Outra aplicação está usando a porta 3000

**Solução 1 - Parar o que está usando a porta:**
```powershell
# Descobrir o que está usando a porta
netstat -ano | findstr :3000

# Pegar o PID (último número) e matar o processo
taskkill /PID <numero_do_pid> /F
```

**Solução 2 - Mudar a porta do projeto:**
Edite `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Mude de 3000 para 3001
```

---

### Erro: "access denied" ou "permission denied"

**Causa:** Docker precisa de permissões de administrador

**Solução:**
1. Feche o terminal atual
2. Abra o PowerShell **como Administrador**:
   - Clique direito no PowerShell
   - Selecione "Executar como administrador"
3. Execute os comandos novamente

---

### Docker Desktop não abre

**Solução 1 - Verificar WSL 2:**
```powershell
wsl --status
```

Se der erro, instale/atualize o WSL 2:
```powershell
wsl --install
wsl --set-default-version 2
```

**Solução 2 - Reiniciar serviço Docker:**
```powershell
# Como administrador
net stop com.docker.service
net start com.docker.service
```

**Solução 3 - Reinstalar Docker Desktop:**
1. Desinstale pelo Painel de Controle
2. Reinicie o computador
3. Baixe e instale novamente

---

## 🎯 Comandos Úteis

### Ver containers rodando
```powershell
docker ps
```

### Parar todos os containers
```powershell
docker compose down
```

### Ver logs do container
```powershell
docker logs ntt-articles-app
docker logs -f ntt-articles-app  # Seguir logs em tempo real
```

### Limpar tudo e recomeçar
```powershell
# Parar e remover containers
docker compose down -v

# Remover imagens antigas
docker rmi ntt-articles-app

# Limpar cache do Docker
docker system prune -a

# Recompilar e iniciar
docker compose up --build
```

### Entrar no container (debugar)
```powershell
docker exec -it ntt-articles-app sh
```

---

## 📚 Recursos Adicionais

- **Documentação Docker Desktop:** https://docs.docker.com/desktop/windows/
- **Troubleshooting Docker:** https://docs.docker.com/desktop/troubleshoot/overview/
- **WSL 2 Backend:** https://docs.docker.com/desktop/windows/wsl/

---

## ✅ Checklist Rápido

Antes de rodar `docker compose up`:

- [ ] Docker Desktop instalado
- [ ] Docker Desktop aberto e rodando (ícone verde)
- [ ] `docker ps` funciona sem erro
- [ ] Porta 3000 está livre
- [ ] Terminal aberto na pasta do projeto

**Se todos marcados, execute:**
```powershell
docker compose up --build
```

🎉 **Sucesso!** Sua aplicação estará em http://localhost:3000
