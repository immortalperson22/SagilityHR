# Sagility HR Portal - System Architecture Document

## 1. Project Overview

### 1.1 Project Name
**Sagility HR Portal** (formerly HR Hub Pro)

### 1.2 Project Type
Full-stack Web Application - Employee Management System

### 1.3 Purpose
A comprehensive HR management platform designed to streamline the employee onboarding process, document management, and applicant tracking system (ATS) for HR departments.

### 1.4 Target Users
- **Administrators** - HR Managers who manage the entire system
- **HR Employees** - Staff members who review and process applications
- **Applicants** - Job seekers who submit documents for onboarding

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Frontend                            ││
│  │  • Single Page Application (SPA)                           ││
│  │  • Role-based Dashboard Rendering                          ││
│  │  • Dark Mode Support                                      ││
│  │  • Responsive Design (Mobile/Desktop)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (SSL/TLS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │   Vercel CDN     │  │  Supabase Auth  │  │ Edge Functions ││
│  │  (Static Files)  │  │  (Authentication│  │ (Email/Logic)  ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Supabase Backend                        ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │ PostgreSQL  │  │   Storage   │  │  Row Level      │  ││
│  │  │  Database   │  │  (PDF Docs) │  │  Security       │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.8.3 | Type Safety |
| Vite | 5.4.19 | Build Tool |
| Tailwind CSS | 3.4.17 | Styling |
| Shadcn/UI | Latest | Component Library |
| React Router | 6.30.1 | Client-side Routing |
| Lucide React | 0.462.0 | Icons |

#### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | Backend-as-a-Service |
| PostgreSQL | 15+ | Relational Database |
| Edge Functions | Deno | Serverless Functions |
| Row Level Security | - | Database Security |

#### Development Tools
| Technology | Purpose |
|------------|---------|
| Git | Version Control |
| npm | Package Management |
| ESLint | Code Linting |
| Prettier | Code Formatting |

---

## 3. Database Architecture

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │  public.profiles │       │ public.user_roles │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │ 1:1                    │ 1:N                     │ N:1
         ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        public.applicants                             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ id (PK) | user_id (FK) | full_name | phone | status | etc.   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      storage.objects (PDF Files)                     │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ id | bucket_id | name | user_id | created_at                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema

#### Table: `public.profiles`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | UUID | NOT NULL, UNIQUE | FK to auth.users |
| full_name | TEXT | NOT NULL | User's full name |
| phone | TEXT | NULLABLE | Contact number |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

#### Table: `public.user_roles`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | UUID | NOT NULL, FK | FK to auth.users |
| role | TEXT | NOT NULL, CHECK | 'admin', 'hr', 'applicant' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Role assignment date |

#### Table: `public.applicants`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | UUID | NOT NULL, FK | FK to auth.users |
| full_name | TEXT | NOT NULL | Applicant name |
| phone | TEXT | NULLABLE | Contact number |
| status | TEXT | DEFAULT 'pending' | pending/approved/rejected |
| admin_comment | TEXT | NULLABLE | Admin review notes |
| pre_employment_url | TEXT | NULLABLE | PDF storage path |
| policy_rules_url | TEXT | NULLABLE | PDF storage path |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Application date |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

### 3.3 Row Level Security (RLS) Policies

The system implements comprehensive RLS policies:

| Table | Policy Name | Description |
|-------|-------------|-------------|
| profiles | Users view own profile | Users can read their own profile |
| profiles | Users update own profile | Users can update their own data |
| profiles | Admins view all | Admins can view all profiles |
| user_roles | Role assignment | Automatic role assignment on signup |
| applicants | Applicants view own | Applicants see only their application |
| applicants | HR view all | HR can view all applications |
| applicants | Admins full access | Admins can perform all operations |

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  User    │────▶│   React     │────▶│ Supabase    │────▶│  PostgreSQL │
│  Action  │     │   Frontend  │     │   Auth      │     │   (Verify) │
└──────────┘     └──────────────┘     └─────────────┘     └─────────────┘
      │                │                    │                   │
      │                │                    │                   │
      ▼                ▼                    ▼                   ▼
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  Login/  │     │  Redirect to │     │ Return JWT  │     │  Validate  │
│ Register │     │    Dashboard  │     │   Token     │     │   Token    │
└──────────┘     └──────────────┘     └─────────────┘     └─────────────┘
```

### 4.2 Security Measures Implemented

1. **Password Security**
   - Minimum 8 characters
   - Requires uppercase, lowercase, number, special character
   - Secure hashing via Supabase Auth

2. **Multi-Factor Authentication (MFA)**
   - TOTP-based authenticator support
   - Optional for all user roles

3. **Role-Based Access Control (RBAC)**
   - Three distinct roles: Admin, HR, Applicant
   - Server-side role verification
   - Database-level RLS policies

4. **Content Security Policy (CSP)**
   - Prevents XSS attacks
   - Restricts script sources
   - Controls external resource loading

5. **Security Headers**
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection enabled
   - Referrer-Policy: strict-origin-when-cross-origin

6. **Secure Password Generation**
   - Cryptographically secure random values
   - 16+ character temporary passwords
   - Auto-generated for invited users

---

## 5. API Architecture

### 5.1 REST Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| /auth/signup | POST | Register new user | Public |
| /auth/login | POST | User authentication | Public |
| /auth/logout | POST | End user session | Authenticated |
| /profiles | GET | Get user profile | Authenticated |
| /profiles | PATCH | Update profile | Authenticated |
| /applicants | GET | List applications | HR/Admin |
| /applicants | POST | Submit application | Applicant |
| /applicants/:id | PATCH | Update status | Admin |
| /user_roles | GET | Get user roles | Authenticated |

### 5.2 Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| send-approval-email | Database Trigger | Send email on approval |
| delete-old-records | Scheduled (Cron) | Auto-delete after 45 days |

---

## 6. Frontend Architecture

### 6.1 Component Hierarchy

```
App.tsx
├── BrowserRouter
│   ├── Routes
│   │   ├── / (Index - Landing)
│   │   ├── /auth (Auth - Login/Register)
│   │   ├── /forgot-password
│   │   ├── /reset-password
│   │   ├── /verify (Email Verification)
│   │   ├── /dashboard (Protected)
│   │   │   ├── AdminDashboard
│   │   │   │   ├── PendingTab
│   │   │   │   ├── ArchivedTab
│   │   │   │   └── TeamTab
│   │   │   ├── HRDashboard
│   │   │   │   ├── PendingTab (View Only)
│   │   │   │   └── ArchivedTab (View Only)
│   │   │   └── ApplicantDashboard
│   │   │       ├── DocumentUpload
│   │   │       ├── ApplicationStatus
│   │   │       └── EditProfile
│   │   └── /dev-mode (Development)
```

### 6.2 State Management

- **React Context** - Authentication state (useAuth)
- **React Query** - Server state caching
- **Local State** - Component-specific state
- **LocalStorage** - Session persistence

---

## 7. Deployment Architecture

### 7.1 Production Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL CDN                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Static Assets (HTML/CSS/JS)                        │   │
│  │  • https://v0-sagility.vercel.app                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE CLOUD                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Database  │  │  Storage   │  │  Edge Functions    │  │
│  │  (Postgres)│  │  (PDFs)    │  │  (Deno Runtime)    │  │
│  └────────────┘  └────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 CI/CD Pipeline

1. **Code Push** → GitHub main branch
2. **Build** → Vercel automatically builds
3. **Deploy** → Automatic to production
4. **Cache** → Global CDN distribution

---

## 8. System Features

### 8.1 Administrator Features
- View all applicant submissions
- Approve or reject applications
- Add comments to applications
- Invite new HR employees
- Delete applicant records
- View application history (Archived)

### 8.2 HR Employee Features
- View all pending applications
- View archived applications (read-only)
- Cannot modify or delete records

### 8.3 Applicant Features
- Register and create profile
- Upload pre-employment documents (PDF)
- Upload policy agreement (PDF)
- Edit personal information
- Track application status
- Receive email notifications on approval

---

## 9. Data Flow Diagrams

### 9.1 Document Upload Flow

```
Applicant              Frontend              Supabase           Storage
   │                      │                     │                  │
   │ 1. Select PDF       │                     │                  │
   │─────────────────────▶│                     │                  │
   │                      │ 2. Upload File      │                  │
   │                      │─────────────────────▶                  │
   │                      │                     │ 3. Store File   │
   │                      │                     │─────────────────▶
   │                      │                     │                  │
   │                      │ 4. Return URL       │ 5. Confirm       │
   │ 6. Show Success     │◀────────────────────│◀─────────────────│
   │◀────────────────────│                     │                  │
```

### 9.2 Approval Workflow

```
Admin                  Database              Edge Function        Email
  │                        │                      │                  │
  │ 1. Click Approve      │                      │                  │
  │───────────────────────▶│                      │                  │
  │                        │ 2. Update Status     │                  │
  │                        │─────────────────────▶│                  │
  │                        │                      │ 3. Send Email   │
  │                        │                      │─────────────────▶
  │                        │                      │                  │
  │ 4. Show Success       │◀─────────────────────│◀─────────────────│
  │◀──────────────────────│                      │                  │
```

---

## 10. System Limitations & Constraints

### 10.1 Technical Constraints
- **Storage**: Supabase Free Tier (1GB limit)
- **Egress**: Monthly data transfer limit (varies by plan)
- **Edge Functions**: Execution time limits apply

### 10.2 Security Constraints
- Anon key exposed in frontend (by design for Supabase)
- Rate limiting handled by Supabase
- Session tokens stored in localStorage

---

## 11. Conclusion

The Sagility HR Portal demonstrates full-stack development competencies including:

- ✅ Modern React frontend with TypeScript
- ✅ Backend-as-a-Service integration (Supabase)
- ✅ Database design with PostgreSQL
- ✅ Row Level Security implementation
- ✅ Role-based access control
- ✅ Secure authentication with MFA support
- ✅ CI/CD deployment pipeline
- ✅ API design and integration

This architecture follows industry best practices and is suitable for educational demonstration as a capstone project.

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Author:** Development Team
