-- =============================================
-- Assignment-6 Development Seed
-- =============================================

-- 1. USERS
INSERT INTO "User"
(
  "id",
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '11111111-1111-4111-8111-111111111111',
  'Admin User',
  'admin@assignment6.com',
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;


INSERT INTO "User"
(
  "id",
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '22222222-2222-4222-8222-222222222222',
  'Project Manager',
  'manager@assignment6.com',
  'MANAGER',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;


INSERT INTO "User"
(
  "id",
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '33333333-3333-4333-8333-333333333333',
  'Team Member',
  'member@assignment6.com',
  'MEMBER',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO NOTHING;


-- 2. ORGANIZATION
INSERT INTO "Organization"
(
  "id",
  "name",
  "description",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '44444444-4444-4444-8444-444444444444',
  'Assignment 6 Organization',
  'Development organization for Assignment-6',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;


-- 3. ORGANIZATION MEMBERS
INSERT INTO "OrganizationMember"
(
  "id",
  "organizationId",
  "userId",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '55555555-5555-4555-8555-555555555551',
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  'OWNER',
  NOW(),
  NOW()
)
ON CONFLICT ("organizationId", "userId") DO NOTHING;


INSERT INTO "OrganizationMember"
(
  "id",
  "organizationId",
  "userId",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '55555555-5555-4555-8555-555555555552',
  '44444444-4444-4444-8444-444444444444',
  '22222222-2222-4222-8222-222222222222',
  'MANAGER',
  NOW(),
  NOW()
)
ON CONFLICT ("organizationId", "userId") DO NOTHING;


INSERT INTO "OrganizationMember"
(
  "id",
  "organizationId",
  "userId",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '55555555-5555-4555-8555-555555555553',
  '44444444-4444-4444-8444-444444444444',
  '33333333-3333-4333-8333-333333333333',
  'MEMBER',
  NOW(),
  NOW()
)
ON CONFLICT ("organizationId", "userId") DO NOTHING;


-- 4. TEAM
INSERT INTO "Team"
(
  "id",
  "name",
  "description",
  "organizationId",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '66666666-6666-4666-8666-666666666666',
  'Development Team',
  'Main project development team',
  '44444444-4444-4444-8444-444444444444',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;


-- 5. TEAM MEMBERS
INSERT INTO "TeamMember"
(
  "id",
  "teamId",
  "userId",
  "createdAt"
)
VALUES
(
  '77777777-7777-4777-8777-777777777771',
  '66666666-6666-4666-8666-666666666666',
  '22222222-2222-4222-8222-222222222222',
  NOW()
)
ON CONFLICT ("teamId", "userId") DO NOTHING;


INSERT INTO "TeamMember"
(
  "id",
  "teamId",
  "userId",
  "createdAt"
)
VALUES
(
  '77777777-7777-4777-8777-777777777772',
  '66666666-6666-4666-8666-666666666666',
  '33333333-3333-4333-8333-333333333333',
  NOW()
)
ON CONFLICT ("teamId", "userId") DO NOTHING;


-- 6. PROJECT
INSERT INTO "Project"
(
  "id",
  "name",
  "description",
  "status",
  "organizationId",
  "teamId",
  "startDate",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '88888888-8888-4888-8888-888888888888',
  'Assignment 6 Project',
  'Project management backend development',
  'ACTIVE',
  '44444444-4444-4444-8444-444444444444',
  '66666666-6666-4666-8666-666666666666',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;


-- 7. SPRINT
INSERT INTO "Sprint"
(
  "id",
  "name",
  "description",
  "status",
  "projectId",
  "startDate",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '99999999-9999-4999-8999-999999999999',
  'Sprint 1',
  'Initial development sprint',
  'ACTIVE',
  '88888888-8888-4888-8888-888888888888',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;


-- 8. TASK
INSERT INTO "Task"
(
  "id",
  "title",
  "description",
  "status",
  "priority",
  "projectId",
  "sprintId",
  "assigneeId",
  "createdById",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Build Authentication Module',
  'Implement authentication for Assignment-6',
  'TODO',
  'HIGH',
  '88888888-8888-4888-8888-888888888888',
  '99999999-9999-4999-8999-999999999999',
  '33333333-3333-4333-8333-333333333333',
  '22222222-2222-4222-8222-222222222222',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
