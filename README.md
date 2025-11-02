# TaskBoard - Multi-tenant Project Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green.svg)

A professional-grade, multi-tenant project management application where organizations can manage projects, tasks, and team members in complete isolation.

## 🎯 Live Demo

- **Frontend**: https://taskboard-demo.vercel.app
- **Backend API**: https://taskboard-api.render.com/api/health

### Test Accounts
```
Email: demo@example.com
Password: demo123

Organization: Demo Company
```

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

### Multi-tenancy
- ✅ Complete data isolation per organization
- ✅ Users can belong to multiple organizations
- ✅ Seamless organization switching without re-authentication
- ✅ Role-based access control (Owner, Admin, Member)

### Project Management
- ✅ Create and manage projects within organizations
- ✅ Assign team members to projects
- ✅ Project status tracking (Active, Completed, Archived)

### Task Management
- ✅ Kanban-style task board (To Do, In Progress, Done)
- ✅ Task prioritization (Low, Medium, High)
- ✅ Task assignment and filtering
- ✅ Real-time status updates

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Intuitive organization switcher
- ✅ Dashboard with statistics
- ✅ Clean, modern UI with Tailwind CSS

## 🛠️ Tech Stack & Justifications

### Backend

#### Express.js (v4.18.2)
**Why**: Industry-standard Node.js framework, lightweight and flexible for building RESTful APIs. Perfect for rapid development with extensive middleware ecosystem.

#### Mongoose (v8.0.3)
**Why**: Robust MongoDB ODM with built-in validation, schema enforcement, and query building. Simplifies data modeling and ensures consistency across the application.

#### JSON Web Token (jsonwebtoken v9.0.2)
**Why**: Standard for stateless authentication. Enables secure, scalable authentication without server-side session storage, perfect for multi-tenant architecture.

#### bcryptjs (v2.4.3)
**Why**: Industry-standard for password hashing. Uses salt rounds for protection against rainbow table attacks. Pure JavaScript implementation (no C++ dependencies).

#### CORS (v2.8.5)
**Why**: Essential for cross-origin resource sharing between frontend and backend. Configurable for security in production environments.

#### dotenv (v16.3.1)
**Why**: Separates configuration from code following 12-factor app principles. Enables different configurations per environment.

### Frontend

#### React (v18.2.0)
**Why**: Component-based architecture for maintainable UI. Virtual DOM for performance. Largest ecosystem and community support.

#### React Router (v6.21.1)
**Why**: Standard routing library for React SPAs. Declarative routing with nested routes, protected routes, and navigation guards.

#### TanStack Query / React Query (v5.17.9)
**Why**: Powerful data fetching and caching library. Eliminates boilerplate, automatic background refetching, optimistic updates, and smart caching strategies. Superior to manual useState/useEffect patterns.

#### Zustand (v4.4.7)
**Why**: Lightweight state management (1KB). Simpler API than Redux with hooks-first design. Perfect for global auth state without Redux complexity.

#### Axios (v1.6.5)
**Why**: Feature-rich HTTP client with interceptors for automatic token injection, request/response transformation, and error handling.

#### Tailwind CSS (v3.4.0)
**Why**: Utility-first CSS framework for rapid UI development. Consistent design system, responsive utilities, and minimal bundle size with PurgeCSS.

#### Vite (v5.0.10)
**Why**: Next-generation frontend tooling. Lightning-fast HMR, optimized builds, and native ES modules. Replaces slower webpack-based tools.

### Database

#### MongoDB Atlas
**Why**: Flexible document model perfect for multi-tenant data. Horizontal scalability, rich query language, and managed cloud service (Atlas) eliminates infrastructure management.

## 🏗️ Multi-tenant Architecture

### Strategy: Single Database with Organization ID Isolation

Every document in the database includes an `organizationId` field to ensure complete data isolation:

```javascript
// Example Task Schema
{
  organizationId: ObjectId,  // CRITICAL for isolation
  projectId: ObjectId,
  title: String,
  status: String,
  // ... other fields
}
```

### Key Security Measures

1. **Middleware Enforcement**: `tenantIsolation` middleware automatically injects `organizationId` into all queries
2. **Database Indexes**: Compound indexes on `(organizationId, ...)` ensure query performance
3. **Query Validation**: All database queries MUST include `organizationId` filter
4. **User Context**: JWT token contains user ID, middleware resolves current organization

### Why This Approach?

- ✅ **Simplicity**: Single codebase, single database
- ✅ **Cost-effective**: No separate databases per tenant
- ✅ **Scalability**: Handles hundreds of organizations easily
- ✅ **Query efficiency**: Proper indexing ensures performance
- ✅ **Backup simplicity**: One database to backup

**Alternative considered**: Separate databases per tenant → Rejected due to operational complexity and higher costs for this scale.

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas account)
- npm or yarn

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/taskboard.git
cd taskboard/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
# App runs on http://localhost:3000
```

### MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Create database user with password
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string and add to backend `.env`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User & Create Organization
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}

Response: 201 Created
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "currentOrganizationId": "...",
    "organizations": [...]
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGc...",
  "user": {...}
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "user": {...}
}
```

#### Switch Organization
```http
POST /auth/switch-organization
Authorization: Bearer {token}
Content-Type: application/json

{
  "organizationId": "65abc..."
}

Response: 200 OK
{
  "message": "Organization switched successfully",
  "currentOrganizationId": "65abc..."
}
```

### Project Endpoints

#### Get All Projects (Current Organization)
```http
GET /projects
Authorization: Bearer {token}

Response: 200 OK
{
  "projects": [...]
}
```

#### Create Project
```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website"
}

Response: 201 Created
{
  "project": {...}
}
```

#### Get Project by ID
```http
GET /projects/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "project": {...}
}
```

#### Update Project
```http
PUT /projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "completed"
}

Response: 200 OK
{
  "project": {...}
}
```

#### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Project deleted successfully"
}
```

### Task Endpoints

#### Get All Tasks (with filters)
```http
GET /tasks?projectId=xxx&status=todo
Authorization: Bearer {token}

Response: 200 OK
{
  "tasks": [...]
}
```

#### Create Task
```http
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectId": "65abc...",
  "title": "Fix login bug",
  "description": "Users can't login with email",
  "status": "todo",
  "priority": "high"
}

Response: 201 Created
{
  "task": {...}
}
```

#### Update Task Status
```http
PATCH /tasks/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "done"
}

Response: 200 OK
{
  "task": {...}
}
```

### Error Responses

All endpoints return consistent error format:
```json
{
  "error": "Error message description"
}
```

Status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist

- [ ] Register new user and organization
- [ ] Login with credentials
- [ ] Create a project
- [ ] Create tasks in project
- [ ] Move tasks between statuses
- [ ] Create second organization
- [ ] Switch between organizations
- [ ] Verify data isolation (can't see other org's data)
- [ ] Invite member to organization (if implemented)
- [ ] Test on mobile viewport

## 🚀 Deployment

### Backend (Render.com)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`
5. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project on Vercel
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: `VITE_API_URL` (Render backend URL)
4. Deploy

### Database (MongoDB Atlas)

Already configured - no deployment needed. Ensure:
- IP whitelist includes `0.0.0.0/0` (all IPs) or specific deployment IPs
- Connection string is added to backend environment variables

## 📂 Project Structure

```
taskboard/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── middlewares/    # Auth, tenant isolation
│   │   └── utils/          # Helper functions
│   ├── tests/              # Jest tests
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/            # API client & endpoints
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🔒 Security Considerations

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Input validation on all endpoints
- ✅ Multi-tenant data isolation enforced at middleware level
- ✅ MongoDB injection protection via Mongoose
- ⚠️ TODO: Rate limiting (for production)
- ⚠️ TODO: HTTPS enforcement (handled by deployment platforms)

## 🎓 Learning Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multitenancy)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👤 Author

Your Name - [GitHub](https://github.com/yourusername) - [LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Anthropic Claude for architecture guidance
- MongoDB University for database design patterns
- Tailwind Labs for the amazing CSS framework
