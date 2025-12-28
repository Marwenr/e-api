# E-commerce Backend API

Production-ready backend API built with Fastify, MongoDB (Mongoose), and clean architecture principles.

## Features

- ✅ Fastify web framework
- ✅ MongoDB with Mongoose ODM
- ✅ Clean architecture structure
- ✅ Global error handling
- ✅ Request validation system
- ✅ Security plugins (Helmet, CORS, Rate Limiting)
- ✅ Structured logging
- ✅ Environment-based configuration
- ✅ Graceful shutdown
- ✅ TypeScript support

## Project Structure

```
src/
├── config/          # Configuration files (environment variables)
├── database/        # MongoDB connection and database logic
├── middleware/      # Error handlers and middleware
├── plugins/         # Fastify plugins registration
├── routes/          # API route handlers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (logger, validation, response helpers)
└── server.ts        # Application entry point
```

## Setup

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or remote)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=3001
NODE_ENV=development
API_PREFIX=/api
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=ecommerce
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000
```

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Type checking:
```bash
npm run typecheck
```

## API Endpoints

### Health Check
- `GET /api/health` - Server and database health status

## Architecture

### Clean Architecture Layers

1. **Routes Layer** (`src/routes/`)
   - HTTP route definitions
   - Route handlers

2. **Middleware Layer** (`src/middleware/`)
   - Error handling
   - Request/response transformations

3. **Plugins Layer** (`src/plugins/`)
   - Fastify plugins registration
   - Security, CORS, rate limiting

4. **Database Layer** (`src/database/`)
   - MongoDB connection management
   - Database utilities

5. **Utils Layer** (`src/utils/`)
   - Logging
   - Validation helpers
   - Response formatters

### Error Handling

The application uses a centralized error handler that:
- Catches all unhandled errors
- Formats consistent error responses
- Handles Mongoose validation errors
- Handles Fastify validation errors
- Provides detailed error information in development

### Request Validation

Validation is handled using Fastify's built-in JSON Schema validation:
- Define schemas using `createValidationSchema()` helper
- Common schemas available in `utils/validation.ts`
- Automatic validation error responses

### Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (development/production/test) | `development` |
| `API_PREFIX` | API route prefix | `/api` |
| `MONGO_URI` | MongoDB connection URI | Required |
| `MONGO_DB_NAME` | MongoDB database name | `ecommerce` |
| `CORS_ORIGIN` | CORS allowed origins (comma-separated or `*`) | `*` |
| `RATE_LIMIT_MAX` | Maximum requests per time window | `100` |
| `RATE_LIMIT_TIME_WINDOW` | Rate limit time window in ms | `60000` |

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: JSON Schema validation on all requests

## Logging

Structured logging with different levels:
- `info`: General information
- `error`: Error messages
- `warn`: Warning messages
- `debug`: Debug information (development only)

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Register the route in `src/routes/index.ts`
3. Use validation schemas for request validation
4. Use response helpers for consistent formatting

Example:
```typescript
// src/routes/users.ts
import { FastifyInstance } from 'fastify';
import { sendSuccess } from '../utils/response';
import { createValidationSchema } from '../utils/validation';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/users',
    {
      schema: createValidationSchema({
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
          },
        },
      }),
    },
    async (request, reply) => {
      // Route handler logic
      return sendSuccess(reply, { users: [] });
    }
  );
}
```

## License

ISC

