# Security Features - Sagility HR Management Platform

## Overview

This document outlines the comprehensive security measures implemented in our **Sagility HR Management Platform**. Our security approach follows the **Defense in Depth** principle - implementing multiple layers of protection against various cyber threats.

---

## Security Architecture Summary

| Layer | Component | Security Feature |
|-------|-----------|------------------|
| **Frontend** | React App | Input Validation, Password Strength Enforcement |
| **Backend** | Supabase | Auth, RLS, API Security |
| **Data/Logic** | Edge Functions | Zero-Egress Admin Isolation, Service Role Auth |
| **Database** | PostgreSQL | Row Level Security, Unique Constraints, Triggers |
| **Infrastructure** | Environment | Secret Management, Secure Config |

---

## Supabase Built-in Security

### Authentication Security

| Feature | Description | Protection Level |
|---------|-------------|------------------|
| **Password Hashing** | Supabase handles secure password hashing with bcrypt | High |
| **Session Management** | Secure session handling with JWT tokens | High |
| **Auto-refresh Tokens** | Automatic token refresh before expiration | Medium |
| **Secure Storage** | Sessions stored in localStorage with encryption | Medium |

### Database Security

| Feature | Description | Protection Level |
|---------|-------------|------------------|
| **Row Level Security (RLS)** | Database-level access control per table | High |
| **Prepared Statements** | SQL injection prevention | High |
| **Foreign Key Constraints** | Data integrity enforcement | High |
| **Check Constraints** | Valid data enforcement | Medium |
| **UUID Primary Keys** | Unpredictable identifiers | Medium |

---

## Implemented Security Features

### 1. Multi-Factor Authentication (MFA)

**Purpose:** Protects user accounts with two-factor verification  
**Attack Prevented:** Credential stuffing, brute force, account takeover

**Implementation:**
- Email OTP (One-Time Password) sent during login
- User must enter 6-digit code from email
- Required for all user roles (Applicant, Employee, Admin)

**Flow:**
```
1. User enters email + password
2. System validates credentials
3. System generates 6-digit OTP
4. OTP sent to user's registered email
5. User enters OTP code
6. System validates OTP (expires in 10 minutes)
7. Login successful
```

### 2. Password Strength Policy

**Purpose:** Ensures strong passwords that are hard to crack  
**Attack Prevented:** Rainbow table attacks, brute force

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Password Strength Indicator:**
```
Weak:   1-2 requirements met
Medium: 3-4 requirements met  
Strong: All 5 requirements met
```

### 3. Row Level Security (RLS)

**Purpose:** Database-level access control  
**Attack Prevented:** Unauthorized data access, data leakage

**Implementation:**

```sql
-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Applicants: Users can only view/edit their own applications
CREATE POLICY "Users can view their own applications"
ON public.applicants FOR SELECT
USING (auth.uid() = user_id);

-- user_roles: Strict 1:1 role per user constraint
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Admins: Can view all data (Verified by user_id check in rls)
CREATE POLICY "Admins can view all"
ON public.applicants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 4. Role-Based Access Control (RBAC)

**Purpose:** Restricts access based on user roles  
**Attack Prevented:** Privilege escalation, unauthorized actions

**Roles:**

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Applicant** | Limited | Submit documents, view own status |
| **Employee** | Medium | Dashboard access, assigned features |
| **Admin** | Full | Manage all users, review applications |

```typescript
// Role check in React
const { role } = useAuth();

if (role === 'admin') {
  // Show admin features
}

if (role === 'employee') {
  // Show employee features
}
```

### 5. Session Security

**Purpose:** Secure user sessions with auto-management  
**Attack Prevented:** Session hijacking, session fixation

**Features:**
- Automatic session refresh
- Session persistence across page reloads
- Secure logout (clears all session data)

```typescript
// Secure signout
const signOut = async () => {
  await supabase.auth.signOut();
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace('/auth');
};
```

### 6. Input Validation

**Purpose:** Validates all user inputs  
**Attack Prevented:** Injection attacks, malformed data

**Validation Points:**
- Frontend: React form validation
- Backend: Supabase validation rules
- Database: Check constraints

**Example (Password):**
```typescript
const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  // ... additional checks
  return '';
};
```

### 7. Zero-Egress Security (Edge Functions)

**Purpose:** Isolate sensitive administrative actions from the client  
**Attack Prevented:** Auth Admin API abuse, client-side credential leaking, bypass of business logic  

**Implementation:**
- Sensitive operations (Invite User, Delete User) are moved to **Supabase Edge Functions**.
- Functions use the `SUPABASE_SERVICE_ROLE_KEY` internally (never exposed to client).
- Frontend calls functions using a standard JWT; the function then verifies the user's 'admin' role before proceeding.
- Result: The user's browser never directly interacts with the core Auth Admin API.

### 8. Database Integrity

**Purpose:** Enforce business rules at the schema level  
**Implementation:**
- `user_roles`: `UNIQUE(user_id)` prevents a user holding multiple conflicting roles.
- `profiles`: `email` column added to ensure auditability of invited users even before full profile completion.
- `upsert` logic: Used in Edge Functions to gracefully handle race conditions between auto-triggers and manual invites.

---

## Security Features Summary

| # | Feature | Attack Prevented | Implementation |
|---|---------|-----------------|----------------|
| 1 | MFA (Email OTP) | Account takeover, brute force | Supabase Edge Functions |
| 2 | Password Policy | Weak passwords | Frontend validation |
| 3 | Row Level Security | Unauthorized access | PostgreSQL RLS |
| 4 | Role-Based Access | Privilege escalation | React + Supabase RBAC |
| 5 | Session Management | Session hijacking | Supabase Auth |
| 6 | Input Validation | Injection attacks | React + Database constraints |

---

## Environment Security

### Environment Variables

Sensitive data is stored in environment variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**Security Notes:**
- Publishable key is safe for frontend (read-only)
- Service role key is kept server-side only
- Never commit `.env` to version control

### Production Security

| Environment | Protection |
|-------------|------------|
| **Vercel** | HTTPS enforced, CDN distributed |
| **Supabase** | DDoS protection, SSL/TLS |
| **Database** | Encrypted at rest, TLS in transit |

---

## Compliance & Best Practices

Our implementation follows industry best practices:

- ✅ OWASP Top 10 vulnerabilities addressed
- ✅ Industry-standard encryption (Supabase handles)
- ✅ Secure session management
- ✅ Protected API endpoints via RLS
- ✅ Input validation and sanitization

---

## Future Security Enhancements

Potential additions for enhanced security:

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| TOTP Authenticator | Medium | Google Authenticator support |
| Backup Codes | Medium | One-time recovery codes |
| IP Whitelisting | Low | Restrict access by IP |
| Login Alerts | Low | Email notification for new logins |
| Session Limits | Low | Max concurrent sessions |

---

## Security Incident Response

If a security incident is discovered:

1. **Report** - Contact administrator immediately
2. **Contain** - Temporarily disable affected accounts
3. **Investigate** - Review logs and access patterns
4. **Remediate** - Fix vulnerability, reset compromised credentials
5. **Document** - Record incident and resolution

---

## Security Contact

For security concerns or vulnerability reports:

- GitHub: [@immortalperson22](https://github.com/immortalperson22)

---

*Document prepared by: JerutaX*  
*Project: Sagility HR Management Platform*  
*Date: March 2026*
