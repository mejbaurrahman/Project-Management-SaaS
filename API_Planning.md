# Project Management SaaS — API Planning

## 1. Assignment Roadmap

| Phase                          | Scope                                                | Status                                |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------- |
| 1. Planning & Database         | Requirements, Prisma schema, migration, API planning | **In progress → API plan added here** |
| 2. Auth & Core APIs            | JWT/Bearer auth, RBAC, users, foundational CRUD      | **Started**                           |
| 3. Business Logic & Validation | 20+ APIs, Zod, errors, pagination, transactions      | Planned                               |
| 4. Payment & Testing           | bKash, callbacks, tests, Postman docs                | Planned                               |
| 5. Deployment & Submission     | Deployment, QA, README, video                        | Planned                               |

## 2. Primary Roles

The assignment requires exactly three primary application roles.

| Role      | Main permissions                                                                         |
| --------- | ---------------------------------------------------------------------------------------- |
| `ADMIN`   | Platform user management, platform analytics, audit visibility, block/unblock users      |
| `MANAGER` | Create/manage organizations, teams, projects, sprints and tasks where membership permits |
| `MEMBER`  | View accessible projects/tasks, update permitted task workflow, comments/attachments     |

`OrganizationRole` (`OWNER`, `MANAGER`, `MEMBER`, `GUEST`) is tenant-scoped membership authorization and does not replace the three primary application roles.

## 3. Multi-tenant Rule

All organization-owned resources must be authorized by organization membership. Knowing a UUID must never allow a user from one organization to access another organization's data.

Resource chain:

`Organization → Team → Project → Sprint → Task → Comment / Attachment / Activity`

## 4. Response Contract

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

Pagination responses may additionally contain `meta`.

## 5. Planned Endpoints

Legend: ✅ implemented in current progress package, ⏳ next/upcoming.

### Authentication

| Status | Method | Endpoint                           | Access        | Purpose                                |
| ------ | ------ | ---------------------------------- | ------------- | -------------------------------------- |
| ✅     | POST   | `/api/v1/auth/register`            | Public        | Register member with email/password    |
| ✅     | POST   | `/api/v1/auth/register/verify-otp` | Public        | Register member with email/otp         |
| ✅     | POST   | `/api/v1/auth/login`               | Public        | Login and issue tokens                 |
| ✅     | POST   | `/api/v1/auth/google`              | Public        | Google/GCP social login using ID token |
| ✅     | POST   | `/api/v1/auth/refresh-token`       | Public/token  | Rotate access/refresh token pair       |
| ✅     | POST   | `/api/v1/auth/logout`              | Authenticated | Clear auth cookies                     |
| ✅     | GET    | `/api/v1/auth/me`                  | Authenticated | Current authenticated user             |

### Users / Admin

| Status | Method | Endpoint                   | Access                 |
| ------ | ------ | -------------------------- | ---------------------- |
| ✅     | PATCH  | `/api/v1/users/me`         | Any authenticated user |
| ✅     | GET    | `/api/v1/users`            | ADMIN                  |
| ✅     | GET    | `/api/v1/users/:id`        | ADMIN                  |
| ✅     | PATCH  | `/api/v1/users/:id/role`   | ADMIN                  |
| ✅     | PATCH  | `/api/v1/users/:id/status` | ADMIN                  |
| ✅     | DELETE | `/api/v1/users/:id`        | ADMIN; soft delete     |

### Organizations

| Status | Method | Endpoint                                         | Access                         |
| ------ | ------ | ------------------------------------------------ | ------------------------------ |
| ⏳     | POST   | `/api/v1/organizations`                          | MANAGER/ADMIN                  |
| ⏳     | GET    | `/api/v1/organizations`                          | Authenticated; own memberships |
| ⏳     | GET    | `/api/v1/organizations/:id`                      | Organization member            |
| ⏳     | PATCH  | `/api/v1/organizations/:id`                      | OWNER / organization MANAGER   |
| ⏳     | DELETE | `/api/v1/organizations/:id`                      | OWNER/ADMIN; soft delete       |
| ⏳     | GET    | `/api/v1/organizations/:id/members`              | Organization member            |
| ⏳     | POST   | `/api/v1/organizations/:id/members`              | OWNER / organization MANAGER   |
| ⏳     | PATCH  | `/api/v1/organizations/:id/members/:userId/role` | OWNER                          |
| ⏳     | DELETE | `/api/v1/organizations/:id/members/:userId`      | OWNER / organization MANAGER   |

### Teams

| Status | Method | Endpoint                            | Access                                  |
| ------ | ------ | ----------------------------------- | --------------------------------------- |
| ⏳     | POST   | `/api/v1/teams`                     | Organization OWNER/MANAGER              |
| ⏳     | GET    | `/api/v1/teams`                     | Organization member                     |
| ⏳     | GET    | `/api/v1/teams/:id`                 | Organization member                     |
| ⏳     | PATCH  | `/api/v1/teams/:id`                 | Organization OWNER/MANAGER              |
| ⏳     | DELETE | `/api/v1/teams/:id`                 | Organization OWNER/MANAGER; soft delete |
| ⏳     | POST   | `/api/v1/teams/:id/members`         | Organization OWNER/MANAGER              |
| ⏳     | DELETE | `/api/v1/teams/:id/members/:userId` | Organization OWNER/MANAGER              |

### Projects

| Status | Method | Endpoint                      | Access                                               |
| ------ | ------ | ----------------------------- | ---------------------------------------------------- |
| ⏳     | POST   | `/api/v1/projects`            | MANAGER + organization access                        |
| ⏳     | GET    | `/api/v1/projects`            | Accessible projects; paginated/filterable/searchable |
| ⏳     | GET    | `/api/v1/projects/:id`        | Project organization member                          |
| ⏳     | PATCH  | `/api/v1/projects/:id`        | MANAGER + organization access                        |
| ⏳     | PATCH  | `/api/v1/projects/:id/status` | MANAGER + organization access                        |
| ⏳     | DELETE | `/api/v1/projects/:id`        | MANAGER + organization access; soft delete           |

Planned list query example:

`GET /api/v1/projects?page=1&limit=10&status=ACTIVE&search=PMS&sortBy=createdAt&sortOrder=desc`

### Sprints

| Status | Method | Endpoint                     |
| ------ | ------ | ---------------------------- |
| ⏳     | POST   | `/api/v1/sprints`            |
| ⏳     | GET    | `/api/v1/sprints`            |
| ⏳     | GET    | `/api/v1/sprints/:id`        |
| ⏳     | PATCH  | `/api/v1/sprints/:id`        |
| ⏳     | PATCH  | `/api/v1/sprints/:id/status` |

### Tasks and Subtasks

| Status | Method | Endpoint                     |
| ------ | ------ | ---------------------------- |
| ⏳     | POST   | `/api/v1/tasks`              |
| ⏳     | GET    | `/api/v1/tasks`              |
| ⏳     | GET    | `/api/v1/tasks/my-tasks`     |
| ⏳     | GET    | `/api/v1/tasks/:id`          |
| ⏳     | PATCH  | `/api/v1/tasks/:id`          |
| ⏳     | DELETE | `/api/v1/tasks/:id`          |
| ⏳     | PATCH  | `/api/v1/tasks/:id/status`   |
| ⏳     | POST   | `/api/v1/tasks/:id/assign`   |
| ⏳     | POST   | `/api/v1/tasks/:id/subtasks` |

Task list will support pagination, filtering by status/priority/project/sprint/assignee, sorting and text search.

### Comments

| Status | Method | Endpoint                         |
| ------ | ------ | -------------------------------- |
| ⏳     | POST   | `/api/v1/tasks/:taskId/comments` |
| ⏳     | GET    | `/api/v1/tasks/:taskId/comments` |
| ⏳     | PATCH  | `/api/v1/comments/:id`           |
| ⏳     | DELETE | `/api/v1/comments/:id`           |

### Attachments

| Status | Method | Endpoint                            |
| ------ | ------ | ----------------------------------- |
| ⏳     | POST   | `/api/v1/tasks/:taskId/attachments` |
| ⏳     | GET    | `/api/v1/tasks/:taskId/attachments` |
| ⏳     | DELETE | `/api/v1/attachments/:id`           |

### Payments — bKash

| Status | Method   | Endpoint                    |
| ------ | -------- | --------------------------- |
| ⏳     | POST     | `/api/v1/payments/initiate` |
| ⏳     | GET/POST | `/api/v1/payments/callback` |
| ⏳     | GET      | `/api/v1/payments/:id`      |
| ⏳     | GET      | `/api/v1/payments`          |

No fake/manual payment success status will be used. Gateway verification must determine payment status.

### Activity / Analytics

| Status | Method | Endpoint                      |
| ------ | ------ | ----------------------------- |
| ⏳     | GET    | `/api/v1/activity-logs`       |
| ⏳     | GET    | `/api/v1/analytics/dashboard` |

## 6. Validation Plan

Every body-changing endpoint uses Zod before its controller. Query/params validation will be added where applicable. Password validation requires at least 8 characters with uppercase, lowercase, number and special character.

## 7. Pagination, Search, Filtering and Sorting

At minimum `GET /projects`, `GET /tasks`, and admin `GET /users` will be paginated. Project/task endpoints will demonstrate filtering, sorting and search as required by the assignment.

## 8. Soft Delete Plan

Models that already contain `deletedAt` will use soft deletes. Normal reads must apply `deletedAt IS NULL`. Deleted rows remain available for audit/history where appropriate.

## 9. Transaction Plan

Transactions will be used for business operations that must be atomic, including:

1. Create organization + add creator as `OWNER` + activity log.
2. Create/assign task + activity log when performed as one operation.
3. Critical status transitions + activity log.
4. Payment status persistence where multiple records/actions must stay consistent.

Prisma 8 transaction form: `db.transaction(async (tx) => { ... })`.

## 10. Audit Log Plan

Critical operations will record `ActivityLog`, including organization creation, membership/role changes, team/project/task creation, task assignments, status transitions, soft deletes and verified payments.

## 11. Security Plan

- Passwords hashed with bcrypt.
- JWT access and refresh secrets are separate.
- Private endpoints accept Bearer tokens; HTTP-only cookies are also supported for auth tokens.
- `helmet`, CORS and API rate limiting remain enabled.
- Blocked/deleted users are rejected by auth middleware.
- Route-level primary RBAC plus service-level tenant authorization.
- Secrets remain in `.env`, never committed.

## 12. Implementation Order

1. ✅ Shared config/error/validation/JWT utilities.
2. ✅ Auth module + Bearer/RBAC middleware.
3. ✅ User module and admin user controls.
4. ⏳ Organization module with first transaction/audit log.
5. ⏳ Team module.
6. ⏳ Project module with pagination/filter/search/sort.
7. ⏳ Sprint module.
8. ⏳ Task/subtask workflows.
9. ⏳ Comments/attachments.
10. ⏳ Activity + analytics.
11. ⏳ Real bKash payment flow.
12. ⏳ Postman collection, testing, deployment, README and video.
