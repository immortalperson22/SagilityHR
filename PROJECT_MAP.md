# Sagility HR Portal - Project Overview

## 1. Project Identification

### 1.1 Project Details
| Field | Information |
|-------|-------------|
| **Project Name** | Sagility HR Portal |
| **Project Type** | Web Application (Capstone Project) |
| **Technology Stack** | React, TypeScript, Supabase, PostgreSQL |
| **Deployment URL** | https://v0-sagility.vercel.app |
| **Repository** | https://github.com/immortalperson22/SagilityHR |

### 1.2 Project Classification
- **Application Domain**: Human Resources / Employee Management
- **Development Paradigm**: Full-Stack Web Development
- **Deployment Model**: Cloud-Native (Serverless)

---

## 2. Project Summary

### 2.1 Problem Statement
Traditional HR processes for employee onboarding involve manual paperwork, physical document submission, and繁琐的审批流程. This project aims to digitize and automate the employee onboarding process through a secure, role-based web application.

### 2.2 Proposed Solution
Sagility HR Portal is a comprehensive web-based platform that enables:
- Online document submission for applicants
- Secure document storage and management
- Streamlined approval workflow for HR teams
- Real-time application status tracking
- Automated email notifications

### 2.3 Target Users
1. **Job Applicants** - Submit onboarding documents digitally
2. **HR Employees** - Review and process applications
3. **Administrators** - Manage the entire system and users

---

## 3. Feature Specifications

### 3.1 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| User Authentication | Secure login/registration with email verification | Required |
| Multi-Factor Authentication (MFA) | TOTP-based two-factor authentication | Required |
| Role-Based Access Control | Three-tier access system (Admin/HR/Applicant) | Required |
| Document Upload | PDF file upload with validation | Required |
| Application Status Tracking | Real-time status updates | Required |
| Approval Workflow | Admin approval/rejection with comments | Required |
| Email Notifications | Automated emails on status changes | Required |
| Team Management | Admin can invite HR employees | Required |
| Profile Management | Edit personal information | Required |
| Dark Mode | Light/Dark theme toggle | Optional |
| Auto-Delete Records | Automatic cleanup after 45 days | Optional |

### 3.2 User Role Matrix

| Feature | Applicant | HR Employee | Administrator |
|---------|-----------|-------------|---------------|
| Register/Login | ✅ | ✅ | ✅ (via invite) |
| View Own Profile | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| Upload Documents | ✅ | ❌ | ❌ |
| View All Applications | ❌ | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ✅ |
| Add Comments | ❌ | ❌ | ✅ |
| Delete Records | ❌ | ❌ | ✅ |
| Invite HR Users | ❌ | ❌ | ✅ |
| View Archived | ❌ | ✅ (Read) | ✅ |

---

## 4. Project Structure

### 4.1 Directory Structure

```
SagilityHR/
├── src/                          # Source Code
│   ├── components/               # React Components
│   │   ├── ui/                   # UI Components (Shadcn)
│   │   ├── auth/                 # Authentication Components
│   │   ├── previews/             # Component Previews
│   │   ├── AdminDashboard.tsx    # Admin Dashboard
│   │   ├── ApplicantDashboard.tsx # Applicant Dashboard
│   │   ├── EmployeeDashboard.tsx # HR Dashboard
│   │   ├── Layout.tsx            # Main Layout
│   │   └── ...                   # Other Components
│   ├── pages/                    # Page Components
│   │   ├── Auth.tsx              # Login/Register
│   │   ├── Dashboard.tsx         # Main Dashboard
│   │   ├── Index.tsx             # Landing Page
│   │   └── ...                   # Other Pages
│   ├── hooks/                    # Custom React Hooks
│   │   └── useAuth.tsx           # Authentication Hook
│   ├── integrations/             # Third-Party Integrations
│   │   └── supabase/             # Supabase Client & Types
│   ├── lib/                      # Utility Functions
│   ├── App.tsx                   # Main App Component
│   └── main.tsx                  # Entry Point
├── public/                       # Static Assets
├── supabase/                     # Backend Configuration
│   ├── migrations/               # Database Migrations
│   └── functions/                # Edge Functions
├── .env                          # Environment Variables
├── package.json                  # Dependencies
├── vite.config.ts                # Vite Configuration
├── tailwind.config.ts            # Tailwind Configuration
└── tsconfig.json                 # TypeScript Configuration
```

### 4.2 File Inventory

| Category | Count | Examples |
|----------|-------|----------|
| React Components | 50+ | Dashboard, Forms, UI elements |
| Page Components | 10+ | Auth, Dashboard, Profile |
| Custom Hooks | 5+ | useAuth, useTheme |
| Database Migrations | 10+ | Schema, RLS, Functions |
| Edge Functions | 2 | Email, Auto-delete |
| Configuration Files | 15+ | Vite, TypeScript, ESLint |

---

## 5. Database Schema Summary

### 5.1 Core Tables

| Table | Records | Purpose |
|-------|---------|---------|
| auth.users | Dynamic | User accounts |
| public.profiles | Dynamic | User profile information |
| public.user_roles | Dynamic | Role assignments |
| public.applicants | Dynamic | Application records |
| storage.objects | Dynamic | Uploaded PDF files |

### 5.2 Database Statistics
- **Total Tables**: 5+ (including system tables)
- **Row Level Security Policies**: 15+
- **Database Functions**: 5+
- **Triggers**: 3+

---

## 6. API Integration

### 6.1 External Services

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Supabase Auth | User authentication | JavaScript SDK |
| Supabase Database | Data storage | REST API |
| Supabase Storage | PDF file storage | SDK |
| Nodemailer (Edge Function) | Email notifications | SMTP |

### 6.2 Authentication Flow
1. User registers with email/password
2. Supabase creates auth.user record
3. Trigger creates profile and user_roles
4. User redirected to role-specific dashboard

---

## 7. Security Implementation

### 7.1 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Security | Supabase Auth (bcrypt hashing) |
| MFA Support | TOTP authenticator apps |
| Session Management | JWT tokens |
| Authorization | Role-based access control |
| Data Protection | Row Level Security (RLS) |
| Input Validation | Client + Server side |
| XSS Prevention | React escaping + CSP |
| CSRF Protection | Supabase built-in |

### 7.2 Security Headers Applied
- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

---

## 8. Development Timeline

### 8.1 Development Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Planning & Design | Week 1-2 | Requirements, Database Schema |
| Frontend Development | Week 3-6 | React Components, Pages |
| Backend Development | Week 7-9 | Database, APIs, Functions |
| Testing & Debugging | Week 10 | QA, Bug Fixes |
| Documentation | Week 11 | Technical Docs |
| Deployment | Week 12 | Production Release |

### 8.2 Milestones Achieved
- [x] Database Schema Design
- [x] User Authentication System
- [x] Role-Based Access Control
- [x] Document Upload System
- [x] Admin Dashboard
- [x] HR Dashboard
- [x] Applicant Dashboard
- [x] Email Notifications
- [x] Production Deployment

---

## 9. Testing Summary

### 9.1 Test Coverage

| Test Type | Status | Description |
|-----------|--------|-------------|
| Unit Testing | Partial | Component-level tests |
| Integration Testing | Partial | API integration tests |
| User Acceptance Testing | Required | End-to-end scenarios |
| Security Testing | Required | Penetration testing |

### 9.2 Test Scenarios
- User registration and login
- Role-based redirects
- Document upload and validation
- Approval workflow
- Email notifications
- Session management
- Edge cases and error handling

---

## 10. Deployment Information

### 10.1 Production Environment

| Component | Provider | URL/Details |
|-----------|----------|--------------|
| Frontend | Vercel | https://v0-sagility.vercel.app |
| Database | Supabase | gvhiemfhscdepjrscfyw.supabase.co |
| Storage | Supabase | Built-in object storage |
| Email | Gmail SMTP | Custom Edge Function |

### 10.2 Deployment Status
- **Status**: ✅ Deployed and Active
- **Last Deploy**: March 2026
- **Auto-Deploy**: Enabled (GitHub Actions)

---

## 11. Future Enhancements

### 11.1 Potential Improvements
- Advanced reporting and analytics
- Integration with external HR systems
- Mobile application development
- Real-time chat support
- Document e-signature integration
- Performance optimization for large datasets

### 11.2 Scalability Considerations
- Load balancing for high traffic
- Database indexing optimization
- CDN for static assets
- Caching strategies

---

## 12. Conclusion

Sagility HR Portal represents a complete full-stack web application demonstrating:
- Modern frontend development with React and TypeScript
- Backend integration with Supabase (BaaS)
- Database design and security with PostgreSQL
- Authentication and authorization best practices
- Cloud deployment and CI/CD pipelines
- Professional documentation suitable for capstone presentation

This project is suitable for academic evaluation as a capstone demonstration of web development competencies.

---

**Document Version:** 1.0  
**Date:** March 2026  
**Prepared For:** Capstone Project Evaluation
