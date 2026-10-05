# PMS - Project Management SaaS Backend

PMS is a backend-only Project Management SaaS built with Node.js, TypeScript, Express, PostgreSQL, Prisma ORM, Redis, JWT, Email OTP, Cloudinary, and bKash.

## Live Link

- **Live API:** https://assignment-6-six-xi.vercel.app/
- **GitHub Repository:** https://github.com/mejbaurrahman/Project-Management-SaaS

## Admin Demo Credentials

- **Email:** testeradmin@gmail.com
- **Password:** Tester@admin12345

## Features

- User registration with Email OTP verification
- Login with email and password
- JWT access and refresh tokens
- Role-based authorization
- Organization and member management
- Team and team-member management
- Project management
- Sprint management
- Task and subtask management
- Comments
- Multiple file uploads with Cloudinary
- Activity logs
- bKash payment integration
- Pagination, filtering, search and sorting
- Soft delete
- Zod validation
- Global error handling

## Tech Stack

```text
Node.js
TypeScript
Express.js
PostgreSQL
Prisma ORM
Redis Cloud
JWT
Zod
Nodemailer
Cloudinary
Multer
bKash
Vercel
```

## Run Locally

```bash
npm install
npx prisma generate
npm run dev
```

Build:

```bash
npm run build
```

Local API:

```text
http://localhost:5000/api/v1
```

Live API:

```text
https://assignment-6-six-xi.vercel.app/api/v1
```

## Main API Modules

```text
/api/v1/auth
/api/v1/users
/api/v1/organizations
/api/v1/teams
/api/v1/projects
/api/v1/sprints
/api/v1/tasks
/api/v1/comments
/api/v1/attachments
/api/v1/activity-logs
/api/v1/payments
```

## Authentication Flow

```text
Register
→ Send OTP to email
→ Verify OTP
→ Create user
→ Issue JWT

Login
→ Verify email and password
→ Issue JWT
```

## File Upload

Use `multipart/form-data`:

```text
files   File
files   File
taskId  Text
```

Files are uploaded to Cloudinary and the generated URL is stored in PostgreSQL.

## Deployment

The backend is deployed on Vercel:

```text
https://assignment-6-six-xi.vercel.app/
```

Add all required environment variables in Vercel Project Settings before deployment.
