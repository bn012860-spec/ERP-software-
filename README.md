# ERP Software (Microservices)

This repository contains the Phase 1 ERP microservices foundation: Auth, Gateway, Student, Academic Structure, Profile, Attendance, and a shared platform package.

We are building the ERP system **service by service**, starting with auth and then expanding into domain services behind the gateway.

---

## Stack Now

- **Frontend:** Next.js (React)
- **Backend:** Node.js (TypeScript)
- **Database:** PostgreSQL
- **Architecture:** Microservices

👉 This is a modern, production-grade stack.

---

## Why Auth Service First?

Auth is the foundation for the whole ERP platform. Every upcoming service (students, academics, billing, etc.) will rely on centralized identity and access control.

This service is responsible for:

- User registration
- User login
- Password hashing
- JWT token issuance
- JWT middleware for bearer-token verification
- `/auth/whoami` endpoint for current-user identity
- Role-aware identity payloads for downstream services

---

## Current Features (Auth Service)

- Register user (`email`, `password`, `role`)
- Login user with credential validation
- Secure password hashing (bcrypt)
- JWT token generation
- Basic role model support:
  - `ADMIN`
  - `TEACHER`
  - `STUDENT`

---

## Project Structure (Auth Service)

```text
auth-service/
│
├── src/
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # JWT/auth middlewares
│   ├── utils/           # Helpers
│   ├── config/          # Config files
│   ├── app.ts           # Express app
│   └── server.ts        # Server entrypoint
│
├── prisma/
│   └── schema.prisma    # PostgreSQL schema
│
├── .env
├── package.json
└── tsconfig.json
```

---

## Local Setup

1. **Clone repository**

   ```bash
   git clone <repo-url>
   cd auth-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```


### NPM 403 Troubleshooting

If you hit `npm ERR! 403 Forbidden`, run:

```bash
npm config get registry
npm config delete proxy
npm config delete https-proxy
npm config delete registry
npm config set registry https://registry.npmjs.org/
```

Then retry:

```bash
npm install
```

Fallback options:

```bash
npm install -g pnpm && pnpm install
# or
npm install -g yarn && yarn install
```

If installs still fail after this, the cause is usually network/firewall policy and you should switch networks (for example, hotspot) or ask your admin to allow npm registry access.

3. **Create `.env`**

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"
   JWT_SECRET="your-super-secret"
   PORT=5000
   ```

4. **Run migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server**

   ```bash
   npx ts-node-dev src/server.ts
   ```

   API base URL: `http://localhost:5000`

---

## Auth API

### Register

- **Method:** `POST`
- **Path:** `/auth/register`

Request body:

```json
{
  "email": "admin@test.com",
  "password": "123456",
  "role": "ADMIN"
}
```

### Login

- **Method:** `POST`
- **Path:** `/auth/login`

Request body:

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "role": "ADMIN"
  }
}
```

### Who Am I (Protected)

- **Method:** `GET`
- **Path:** `/auth/whoami`
- **Header:** `Authorization: Bearer <token>`

Response:

```json
{
  "userId": "user_id",
  "role": "ADMIN"
}
```

---

## Role in ERP Microservices Architecture

Other services will use this auth service to:

- Verify identity via JWT
- Read user context (`userId`, `role`)
- Enforce role-based access in service-specific flows
- Re-validate JWT in each service even when requests pass through gateway

Each microservice will keep its **own database** while trusting auth for identity.

---

## Roadmap (Next Steps)

- Add refresh token flow
- Add role-based access control (RBAC) guards
- Add API gateway integration
- Add rate limiting + security hardening

---


## API Gateway Starter

A starter API Gateway scaffold has been added under `gateway/` to continue architecture work even when package installation is blocked by network policy. See `gateway/README.md` for routing plan and JWT forwarding flow.

---

## ERP Services Plan

- ✅ Auth Service (current)
- ✅ Student Service (starter)
- ✅ Academic Structure Service (starter)
- 🔜 Academic Service
- ✅ Profile Service (starter)
- ✅ Attendance Service (starter)
- 🔜 Billing Service

---

## Author

ERP Microservices Project

---


## Student Service (Phase 2 Starter)

A Student Service starter has been added under `student-service/` with:

- Prisma schema for student identity/enrollment profile boundaries
- JWT verification middleware inside the service (defense in depth)
- Zod-based payload validation for create/update student endpoints
- Shared validation middleware (`validateRequest`) for consistent request contract enforcement
- Centralized error handler middleware for consistent API error shapes
- Routes:
  - `GET /students?page=1&limit=20&status=ACTIVE&classId=cls_1&search=nakul&sortBy=firstName&order=asc` (pagination + filtering + sorting)
  - `POST /students`
  - `GET /students/:studentId`
  - `PATCH /students/:studentId`
  - `DELETE /students/:studentId` (soft archive)
  - `POST /students/:studentId/restore` (restore archived student)
- Soft-delete support via `deletedAt` + `ARCHIVED` status
- `/health` endpoint with database connectivity status and graceful shutdown handling


---

## Academic Structure Service (Phase 3 Starter)

A starter Academic Structure Service has been added under `academic-structure-service/` with:

- Prisma models for `AcademicYear`, `Department`, `Program`, `Class`, and `Section`
- JWT verification middleware inside the service
- Zod validation middleware for structure create endpoints
- Shared `validateRequest` from `packages/shared`
- DB-aware `/health` endpoint
- Routes under `/structure` for list/create operations:
  - `GET/POST /structure/academic-years`
  - `GET /structure/academic-years/current`
  - `GET/POST /structure/departments`
  - `GET/POST /structure/programs`
  - `GET/POST /structure/classes`
  - `GET/POST /structure/sections`

This service is the organizational backbone for Student, Attendance, Exams, Timetable, and Billing modules. It also enforces a single-current-academic-year invariant during creation.


---

## Profile Service (Phase 4 Starter)

A starter Profile Service has been added under `profile-service/` with:

- Prisma models for `TeacherProfile` and `StaffProfile`
- JWT verification middleware inside the service
- Shared `validateRequest` for payload validation
- DB-aware `/health` endpoint
- Routes under `/profiles`:
  - `GET/POST /profiles/teachers`
  - `GET/PATCH/DELETE /profiles/teachers/:teacherId`
  - `POST /profiles/teachers/:teacherId/restore`
  - `GET/POST /profiles/staff`
  - `GET/PATCH/DELETE /profiles/staff/:staffId`
  - `POST /profiles/staff/:staffId/restore`

This service owns institutional profile metadata while Auth Service remains the source of authentication identity.


---

## Attendance Service (Phase 5 Starter)

A starter Attendance Service has been added under `attendance-service/` with daily attendance tracking for students and teachers.

- Prisma models for `StudentAttendance` and `TeacherAttendance`
- Shared `AttendanceStatus` (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`) and `AttendanceMarkSource` (`MANUAL`, `IMPORT`, `SYSTEM`) contracts
- JWT verification middleware inside the service
- Shared `validateRequest` for request payload validation
- Shared response envelopes and shared pagination metadata
- DB-aware `/health` endpoint
- Routes under `/attendance`:
  - `GET/POST /attendance/students`
  - `PATCH /attendance/students/:attendanceId`
  - `GET/POST /attendance/teachers`
  - `PATCH /attendance/teachers/:attendanceId`

This service intentionally starts with daily attendance first. Period-wise attendance can be added later after timetable and subject allocation services exist.


---

## Shared Package

The shared package under `packages/shared/` now provides:

- `AppError`
- `validateRequest`
- `logEvent`, `logInfo`, `logWarn`, `logError`
- Shared API types (`AuthUser`, `JwtPayload`, `PaginationMeta`, `ApiSuccessResponse`, `ApiErrorResponse`, `AuthenticatedRequest`)
- Shared error codes (`VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`, `RESOURCE_ARCHIVED`, `RESOURCE_ALREADY_EXISTS`, etc.)
- Pagination helper (`buildPaginationMeta`)
- Shared enums (`ResourceStatus`, `AttendanceStatus`, `AttendanceType`, `AttendanceMarkSource`) for reusable lifecycle and attendance domain contracts
- Response helpers (`sendSuccess`, `sendError`) for standardized API envelopes
