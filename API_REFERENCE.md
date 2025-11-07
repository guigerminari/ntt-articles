# 📚 API Endpoints Reference

Base URL: `http://localhost:3000`

## Table of Contents
1. [Health & Status](#health--status)
2. [Authentication](#authentication)
3. [Users Management](#users-management)
4. [Articles Management](#articles-management)
5. [Response Codes](#response-codes)
6. [Error Responses](#error-responses)

---

## Health & Status

### GET /
Check if API is running

**Authorization:** None required

**Response:**
```json
{
  "status": "ok",
  "message": "NTT Articles API is running",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```

### GET /health
Detailed health check with uptime

**Authorization:** None required

**Response:**
```json
{
  "status": "ok",
  "uptime": 3600.5,
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```

---

## Authentication

### POST /auth/login
Authenticate user and get JWT token

**Authorization:** None required

**Request Body:**
```json
{
  "email": "root@ntt.com",
  "password": "rootpassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Root User",
    "email": "root@ntt.com",
    "permission": "Admin"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Invalid email format or missing fields

---

## Users Management

All user endpoints require **Admin** permission.

### POST /users
Create a new user

**Authorization:** Bearer Token (Admin only)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "permissionId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `permissionId`: Required, valid UUID, must exist

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "John Doe",
  "email": "john@example.com",
  "permissionId": "550e8400-e29b-41d4-a716-446655440001",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - User doesn't have Admin permission
- `409 Conflict` - Email already exists
- `400 Bad Request` - Validation errors

---

### GET /users
List all users

**Authorization:** Bearer Token (Admin only)

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Root User",
    "email": "root@ntt.com",
    "createdAt": "2025-11-04T10:00:00.000Z",
    "updatedAt": "2025-11-04T10:00:00.000Z",
    "permission": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Admin",
      "description": "Full access to manage articles and users"
    }
  }
]
```

**Note:** Password field is never returned

---

### GET /users/:id
Get user by ID

**Authorization:** Bearer Token (Admin only)

**URL Parameters:**
- `id` (UUID): User ID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z",
  "permission": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Editor",
    "description": "Access to manage articles"
  }
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

### PATCH /users/:id
Update user

**Authorization:** Bearer Token (Admin only)

**URL Parameters:**
- `id` (UUID): User ID

**Request Body:** (all fields optional)
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "password": "newpassword123",
  "permissionId": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "permissionId": "550e8400-e29b-41d4-a716-446655440003",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T11:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `409 Conflict` - Email already exists

---

### DELETE /users/:id
Delete user

**Authorization:** Bearer Token (Admin only)

**URL Parameters:**
- `id` (UUID): User ID

**Response (200):**
No content (empty response)

**Error Responses:**
- `404 Not Found` - User not found

---

## Articles Management

### POST /articles
Create a new article

**Authorization:** Bearer Token (Admin or Editor)

**Request Body:**
```json
{
  "title": "My First Article",
  "content": "This is the content of my article. It can be a long text..."
}
```

**Validation Rules:**
- `title`: Required, string
- `content`: Required, string

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "title": "My First Article",
  "content": "This is the content of my article. It can be a long text...",
  "creatorId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - User doesn't have Admin or Editor permission
- `400 Bad Request` - Validation errors

**Note:** The `creatorId` is automatically set from the authenticated user's token

---

### GET /articles
List all articles

**Authorization:** Bearer Token (All authenticated users)

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "title": "My First Article",
    "content": "This is the content of my article...",
    "creatorId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-11-04T10:30:00.000Z",
    "updatedAt": "2025-11-04T10:30:00.000Z",
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Root User",
      "email": "root@ntt.com"
    }
  }
]
```

---

### GET /articles/:id
Get article by ID

**Authorization:** Bearer Token (All authenticated users)

**URL Parameters:**
- `id` (UUID): Article ID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "title": "My First Article",
  "content": "This is the content of my article...",
  "creatorId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T10:30:00.000Z",
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Root User",
    "email": "root@ntt.com"
  }
}
```

**Error Responses:**
- `404 Not Found` - Article not found

---

### PATCH /articles/:id
Update article

**Authorization:** Bearer Token (Admin or Editor)

**URL Parameters:**
- `id` (UUID): Article ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Article Title",
  "content": "Updated content..."
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "title": "Updated Article Title",
  "content": "Updated content...",
  "creatorId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-11-04T10:30:00.000Z",
  "updatedAt": "2025-11-04T11:00:00.000Z",
  "creator": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Root User",
    "email": "root@ntt.com"
  }
}
```

**Error Responses:**
- `403 Forbidden` - User doesn't have Admin or Editor permission
- `404 Not Found` - Article not found

---

### DELETE /articles/:id
Delete article

**Authorization:** Bearer Token (Admin or Editor)

**URL Parameters:**
- `id` (UUID): Article ID

**Response (200):**
No content (empty response)

**Error Responses:**
- `403 Forbidden` - User doesn't have Admin or Editor permission
- `404 Not Found` - Article not found

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists (e.g., email) |
| 500 | Internal Server Error - Server error |

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Validation Error Example:
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

### Unauthorized Error:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Forbidden Error:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Not Found Error:
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### Conflict Error:
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

---

## Permission Matrix

| Endpoint | Admin | Editor | Reader |
|----------|-------|--------|--------|
| POST /auth/login | ✅ | ✅ | ✅ |
| GET / | ✅ | ✅ | ✅ |
| GET /health | ✅ | ✅ | ✅ |
| POST /users | ✅ | ❌ | ❌ |
| GET /users | ✅ | ❌ | ❌ |
| GET /users/:id | ✅ | ❌ | ❌ |
| PATCH /users/:id | ✅ | ❌ | ❌ |
| DELETE /users/:id | ✅ | ❌ | ❌ |
| POST /articles | ✅ | ✅ | ❌ |
| GET /articles | ✅ | ✅ | ✅ |
| GET /articles/:id | ✅ | ✅ | ✅ |
| PATCH /articles/:id | ✅ | ✅ | ❌ |
| DELETE /articles/:id | ✅ | ✅ | ❌ |

---

## Authentication Header Format

All protected endpoints require the following header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token is obtained from the `/auth/login` endpoint and expires after 24 hours (configurable).

---

## Example Requests with cURL

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@ntt.com","password":"rootpassword"}'
```

### Create Article (with token)
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Article","content":"This is a test"}'
```

### List Articles
```bash
curl -X GET http://localhost:3000/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**For more examples and testing scenarios, see `API_TESTING.md`**
