# 🚀 Installation & Deployment Guide

## Prerequisites

Before starting, ensure you have installed:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)

### Verify Prerequisites

```powershell
# Check Docker version
docker --version
# Expected: Docker version 20.x or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.x or higher
```

## 📦 Installation Steps

### Step 1: Navigate to Project Directory

```powershell
cd C:\Users\Guilherme\Documents\dev\ntt\ntt-articles
```

### Step 2: Build and Start the Application

```powershell
docker compose up --build
```

**What happens during this step:**
1. ✅ PostgreSQL container is created and started
2. ✅ Application Docker image is built
3. ✅ PostgreSQL database is initialized
4. ✅ Database migrations are executed automatically
5. ✅ Seed data is inserted (permissions and root user)
6. ✅ Application starts on port 3000

**Wait for this message:**
```
ntt-articles-app  | Application is running on: http://[::]:3000
```

### Step 3: Verify Installation

Open another terminal and run:

```powershell
# Test the health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 5.123,
  "timestamp": "2025-11-04T..."
}
```

## 🧪 Testing the API

### Test 1: Login with Root User

```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"root@ntt.com","password":"rootpassword"}'

$token = $loginResponse.access_token
Write-Host "✅ Login successful! Token: $($token.Substring(0,20))..."
```

### Test 2: Create an Article

```powershell
$article = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"title":"Test Article","content":"This is a test article created via API"}'

Write-Host "✅ Article created with ID: $($article.id)"
```

### Test 3: List All Articles

```powershell
$articles = Invoke-RestMethod -Uri "http://localhost:3000/articles" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

Write-Host "✅ Found $($articles.Count) article(s)"
```

### Test 4: List All Users

```powershell
$users = Invoke-RestMethod -Uri "http://localhost:3000/users" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

Write-Host "✅ Found $($users.Count) user(s)"
```

## 📊 Verify Database

```powershell
# Connect to PostgreSQL
docker exec -it ntt-articles-db psql -U postgres -d ntt_articles
```

Inside PostgreSQL:
```sql
-- List all tables
\dt

-- Check permissions
SELECT * FROM permissions;

-- Check users (without passwords)
SELECT id, name, email FROM users;

-- Check articles
SELECT id, title FROM articles;

-- Exit
\q
```

## 🔍 Monitoring & Logs

### View Application Logs

```powershell
# View all logs
docker logs ntt-articles-app

# Follow logs in real-time
docker logs -f ntt-articles-app

# View last 50 lines
docker logs ntt-articles-app --tail 50
```

### View Database Logs

```powershell
docker logs ntt-articles-db
```

### View Running Containers

```powershell
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    STATUS         PORTS
abc123...      ntt-articles-app        Up 2 minutes   0.0.0.0:3000->3000/tcp
def456...      postgres:15-alpine      Up 2 minutes   0.0.0.0:5432->5432/tcp
```

## 🛠️ Common Operations

### Stop the Application

```powershell
# Method 1: Ctrl+C in the terminal where docker compose is running

# Method 2: Stop containers
docker compose stop

# Method 3: Stop and remove containers
docker compose down
```

### Restart the Application

```powershell
docker compose restart
```

### View Container Status

```powershell
docker compose ps
```

### Execute Commands Inside Container

```powershell
# Access application container shell
docker exec -it ntt-articles-app sh

# Run migrations manually
docker exec ntt-articles-app npm run migration:run

# Run seeds manually
docker exec ntt-articles-app npm run seed
```

## 🔄 Reset Everything

If you need to start fresh:

```powershell
# Stop and remove containers, networks, and volumes
docker compose down -v

# Remove the application image
docker rmi ntt-articles-app

# Start again
docker compose up --build
```

## 🐛 Troubleshooting

### Port Already in Use

**Error:** "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Option 1: Kill the process
taskkill /PID <PID> /F

# Option 2: Change port in docker-compose.yml
# ports:
#   - "3001:3000"  # Use port 3001 instead
```

### Database Connection Issues

**Symptoms:** Application can't connect to database

**Solution:**
```powershell
# Check if database is healthy
docker ps

# Should show "healthy" status for postgres container
# If not, wait a few more seconds or check logs:
docker logs ntt-articles-db
```

### Migration Errors

**Symptoms:** Migrations fail to run

**Solution:**
```powershell
# Stop everything
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# Start again
docker compose up
```

### "Cannot find module" Errors

**Symptoms:** Build fails with TypeScript errors

**Solution:**
```powershell
# Rebuild with no cache
docker compose build --no-cache app
docker compose up
```

## 📈 Performance Tips

### Check Resource Usage

```powershell
# View container stats
docker stats
```

### Optimize Database

```powershell
# Access database
docker exec -it ntt-articles-db psql -U postgres -d ntt_articles

# Run vacuum
VACUUM ANALYZE;
```

## 🔐 Security Considerations

### Change Default Credentials

Before deploying to production:

1. Edit `docker-compose.yml`:
```yaml
environment:
  JWT_SECRET: "your-very-secure-random-secret-key-here"
  DB_PASSWORD: "your-secure-database-password"
```

2. Update root user password:
```sql
-- Connect to database
docker exec -it ntt-articles-db psql -U postgres -d ntt_articles

-- Update password (use a hashed version)
UPDATE users SET password = 'new-bcrypt-hash' WHERE email = 'root@ntt.com';
```

## 📝 Environment Variables

Available environment variables (in `.env` or `docker-compose.yml`):

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | production | Application environment |
| DB_HOST | postgres | Database host |
| DB_PORT | 5432 | Database port |
| DB_USERNAME | postgres | Database username |
| DB_PASSWORD | postgres | Database password |
| DB_DATABASE | ntt_articles | Database name |
| JWT_SECRET | your-secret-key-change-in-production | JWT secret key |
| JWT_EXPIRATION | 24h | JWT expiration time |

## 🎯 Next Steps

After successful installation:

1. ✅ **Read the API Documentation**: Check `API_TESTING.md`
2. ✅ **Try All Endpoints**: Use the examples in `QUICK_START.md`
3. ✅ **Create Test Users**: With different permission levels
4. ✅ **Test Authorization**: Verify permission restrictions work
5. ✅ **Check Database**: Verify data persistence

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review application logs: `docker logs ntt-articles-app`
3. Review database logs: `docker logs ntt-articles-db`
4. Verify all prerequisites are installed correctly
5. Try resetting everything: `docker compose down -v && docker compose up --build`

## ✅ Installation Checklist

- [ ] Docker and Docker Compose installed
- [ ] Project directory accessible
- [ ] Ports 3000 and 5432 are available
- [ ] `docker compose up --build` completed successfully
- [ ] Health check endpoint returns OK
- [ ] Login with root user successful
- [ ] Can create and list articles
- [ ] Database contains seed data

---

**Congratulations! Your NTT Articles system is now running!** 🎉
