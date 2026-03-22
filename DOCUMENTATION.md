# Sagility - Development Documentation

**Project:** Sagility - Employee Management Platform
**Date:** March 22, 2026
**Version:** 1.8

---

## Version History

This document tracks all changes, additions, and fixes made throughout the development of the Sagility platform.

### Version 1.0 (February 3, 2026)
Initial release of the Sagility Employee Management Platform.

**Added:**
- Complete authentication system with Sign In and Sign Up functionality
- Role-based access control (Admin, Employee, Applicant roles)
- Separate state management for Sign In and Sign Up forms
- Password visibility toggle with eye icons
- Automatic field clearing on tab switch
- MFA support (Email/SMS OTP-based)
- Dark mode support throughout the application
- Database schema with user_roles and document_uploads tables
- Row Level Security (RLS) policies
- Responsive design for desktop and mobile

### Version 1.1 (February 8, 2026)
Enhanced authentication and password requirements.

**Fixed:**
- Password validation to properly accept @ symbol and special characters
- Redirect to login page after successful password reset
- Password visibility toggle added to Reset Password page

**Added:**
- Comprehensive password validation requirements (8+ chars, upper, lower, number, special)
- Real-time password strength indicator (Weak/Medium/Strong)

### Version 1.2 (February 8, 2026)
Implemented complete password reset functionality and email templates.

**Added:**
- Password Reset Feature with dedicated ForgotPassword component
- Password Reset Feature with dedicated ResetPassword component
- Brand color #00CEC8 (Teal) documentation and usage
- Localhost URL configuration for password reset redirect

### Version 1.3 (February 8, 2026)
UI/UX improvements and email template enhancements.

**Added:**
- Password strength meter colors (red/orange/yellow/green) for better visual feedback
- Increased font sizes on Auth page for improved readability
- Dark mode text color fixes for password strength indicator
- Email templates (Confirm Sign-Up & Reset Password) with teal (#00CEC8) branding
- Logo.png moved to public/ folder for email templates
- Dashboard redirect prevention when resetting password (localStorage flag system)

### Version 1.4 (February 13, 2026)
Simplified authentication flow and removed phone verification.

**Removed:**
- Phone number input from signup form
- SMS and Voice verification options from MFA
- Custom MFA modal from signup flow (now uses Supabase email confirmation)

**Fixed:**
- Password visibility toggle icons (Eye/EyeOff now display correctly)

**Added:**
- OPERATIONS.md for session tracking and conversation history
- Simplified signup flow using Supabase built-in email confirmation

### Version 1.7 (February 26, 2026)
Admin Dashboard Enhancement with Approval/Rejection Tracking and Auto-Delete.

**Added:**
- Email notification system with SMTP (Google App Password) for approval notifications
- Company branding changed from "HR Hub Pro" to "Sagility" in email template
- PDF files now include applicant name in filename (e.g., "JOHN_DOE-pre-employment.pdf")
- Reject button added to Admin Dashboard
- Archived tab in Admin Dashboard showing approved and rejected applicants
- Approval tracking columns: approved_at, approved_by, rejected_at, rejected_by
- Delete button in Admin Dashboard to remove PDF files from storage + user account from Auth
- Auto-delete Edge Function ("delete-old-records") for removing records older than 45 days
- Team tab in Admin Dashboard - invite and manage Admins and HR Employees
- HR Employee role with view-only access (cannot Approve/Reject/Delete)
- Permission controls - action buttons hidden for non-admin users
- Last admin deletion protection
- Edit Name button for applicants to update their profile
- Auto-profile creation via database trigger (handle_new_user)
- Assign default role function (assign_default_role)

**Removed:**
- Employee role - not used in workflow
- Unused tables: document_uploads, submissions

**Database Changes:**
- Added columns to applicants table: approved_at, rejected_at, approved_by, rejected_by
- Added hr role to app_role enum
- Dropped unused tables: document_uploads, submissions

**Edge Functions:**
- send-approval-email: Sends email notification when applicant is approved
- delete-old-records: Scheduled function to auto-delete records after 45 days

**Database Functions:**
- handle_new_user(): Trigger to auto-create profiles on signup
- assign_default_role(): Assigns default 'applicant' role to new users

**Design & UI:**
- **Improved Workflow**: Removed the "Reject" button to streamline the admin review process. Added a "Smart Resubmit" feature allowing applicants to edit previous PDF versions via Sejda instead of starting over.
- **Applicant Visibility**: Added "Open Document" (Eye icon) buttons to the applicant dashboard, matching the admin view for better verification.
- **Storage Optimization**: Implemented file overwrite (upsert) logic to prevent duplication in Supabase storage and stay within free tier limits.
- **Premium Aesthetics**: Fully integrated the teal/dark theme from the designs into the shared `ApplicantDashboard` and `AdminDashboard` components.
- **Improved Feedback**: Admins can now provide granular feedback (per-document comments) in addition to overall conclusions.

**Infrastructure & Database:**
- **Storage Policies**: Fixed a critical blocker by adding RLS policies for the `applicant-docs` bucket, allowing secure uploads and viewing.
- **Schema Synchronization**: Added missing feedback columns and foreign key relationships to the `applicants` table to match the UI requirements.
- **Automated Profiles**: Implemented a database trigger (`handle_new_user`) to automatically create and sync user profiles from auth metadata, ensuring applicant names are never missing.
- **RLS Fixes**: Resolved infinite recursion in `user_roles` policies and established the missing relationship between `applicants` and `profiles` in the schema cache.
- **Role Promotion**: Finalized the logic for promoting approved applicants to employees automatically.

### Version 1.8 (March 22, 2026)
UI Refinement & Egress Optimization.

**Fixed:**
- Redundant password toggle icons in Microsoft Edge and Chromium browsers (CSS reset).
- Corrected Deno environment types in `supabase/functions` for improved IDE support.

**Added:**
- Frontend-triggered approval emails: The `AdminDashboard` now invokes the `send-approval-email` function directly upon approval.

**Removed:**
- Database-level HTTP trigger for approval emails (avoiding direct DB egress).
- Removed `extensions.http` dependency from the approval workflow.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Authentication System](#authentication-system)
3. [Password Reset Feature](#password-reset-feature)
4. [Database Schema](#database-schema)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Technical Stack](#technical-stack)
7. [Features Implemented](#features-implemented)
8. [Files Modified](#files-modified)
9. [Known Issues](#known-issues)
10. [Setup Instructions](#setup-instructions)
11. [Testing Checklist](#testing-checklist)
12. [Next Steps](#next-steps)
13. [Git Commit History](#git-commit-history)
14. [Conclusion](#conclusion)

---

## Project Overview

Sagility is an employee management platform built with modern web technologies. It features role-based authentication, email-based MFA (multi-factor authentication), PDF document submission workflows, and secure data handling.

### Key Objectives

- Secure authentication system with role-based access control
- Employee application and management workflow
- Document submission and review process
- Responsive design for desktop and mobile

---

## Authentication System

### Authentication Features

The authentication system has been significantly enhanced with the following improvements:

#### 1. Complete State Separation

The Auth component maintains completely separate state for Sign In and Sign Up forms, eliminating data persistence issues when switching between tabs.

**Sign In State:**
```typescript
const [signInEmail, setSignInEmail] = useState('');
const [signInPassword, setSignInPassword] = useState('');
const [showSignInPassword, setShowSignInPassword] = useState(false);
```

**Sign Up State:**
```typescript
const [signUpEmail, setSignUpEmail] = useState('');
const [signUpPassword, setSignUpPassword] = useState('');
const [signUpName, setSignUpName] = useState('');
const [signUpPhone, setSignUpPhone] = useState('');
const [showSignUpPassword, setShowSignUpPassword] = useState(false);
```

#### 2. Password Visibility Toggle

Password visibility toggles were added to both password fields using Lucide React icons:

**Features:**
- EyeOff icon when password is visible
- Eye icon when password is hidden
- Click toggle switches between `type="password"` and `type="text"`
- Icons positioned absolutely within the input field
- Smooth hover transitions
- Full dark mode support

**CSS Implementation:**
See `src/index.css` for complete styling.

#### 3. Automatic Field Clearing

Implemented `resetSignUp()` and `resetSignIn()` functions that:
- Clear all form fields when toggling between Sign In and Sign Up
- Clear visibility toggle states
- Clear password error messages
- Ensure no data persists between form switches

**Toggle Handlers:**
```typescript
const resetSignUp = () => {
  setSignUpEmail('');
  setSignUpPassword('');
  setSignUpName('');
  setSignUpPhone('');
  setShowSignUpPassword(false);
  setPasswordError('');
};

const resetSignIn = () => {
  setSignInEmail('');
  setSignInPassword('');
  setShowSignInPassword(false);
};

const handleSwitchToSignIn = () => {
  resetSignUp();
  setIsActive(false);
};

const handleSwitchToSignUp = () => {
  resetSignIn();
  setIsActive(true);
};
```

#### 4. Multi-Factor Authentication (MFA)

The system supports Email-based MFA for enhanced security:
- MFA Prompt modal appears during sign-in for enabled users
- Email verification is used (no SMS/Voice)
- Users receive verification codes via email
- 6-digit verification codes are sent via console log (test mode)

**Note:** As of Version 1.4, phone/SMS verification was removed. MFA uses email-only verification.

#### 5. Password Strength Requirements

Sign-up enforces strong passwords with real-time validation:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)
- Visual strength indicator shows weak/medium/strong

**Validation Function:**
```typescript
const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[@$!%*?&]/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)';
  }
  return '';
};
```

---

## Password Reset Feature

### Overview

Added complete password reset flow with email verification allowing users to recover their accounts securely.

### Features

#### 1. Forgot Password Page

**Route:** `/forgot-password`
**File:** `src/components/auth/ForgotPassword.tsx`

- User enters email to receive password reset link
- Email validation with error messages
- Loading state during submission
- Success message confirming email sent
- Link back to login page
- Responsive design with dark mode support

**Usage:**
1. User navigates to `/forgot-password`
2. Enters registered email address
3. Clicks "Send Reset Link"
4. Receives email with reset link
5. Clicks link to set new password

#### 2. Reset Password Page

**Route:** `/reset-password`
**File:** `src/components/auth/ResetPassword.tsx`

- User sets new password after clicking email link
- Comprehensive password validation
- Password visibility toggle (Eye/EyeOff icons)
- Confirm password validation
- Real-time password strength checklist
- Redirect to login page after successful reset
- Loading states and error handling

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@, #, $, etc.)

**Redirect Behavior:**
- After successful password update, waits 1.5 seconds
- Automatically redirects to `http://localhost:8080/auth`
- Displays success message before redirect

### Supabase Configuration

#### Redirect URL Configuration

**Required Setting:** Add redirect URL in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/gvhiemfhscdepjrscfyw/auth/url-configuration
2. Add to **Additional Redirect URLs**:
   ```
   http://localhost:8080/reset-password
   ```
3. Click **Save**

#### Email Templates

Supabase automatically sends password reset emails. Default template includes:
- Reset link with token
- Expiration time
- Security notice

Customize at: **Authentication** → **Templates** → **Password Reset**

### Security Features

1. **Secure Password Storage**
   - Supabase handles password hashing (bcrypt)
   - No plain text passwords stored

2. **Token-Based Reset**
   - Time-limited reset tokens
   - One-time use only
   - Invalidated after successful reset

3. **Rate Limiting**
   - Supabase handles abuse protection
   - Prevents mass password reset attacks

### Error Handling

| Error | Message |
|-------|---------|
| Email not found | "User not found" |
| Rate limited | "Too many requests" |
| Token expired | "Reset link expired" |
| Password too weak | Detailed validation message |

### Brand Colors

The Forgot Password and Reset Password pages use the project's brand color:

| Element | Color |
|---------|-------|
| Submit Buttons | `#00CEC8` (Teal) |
| Links | `#00CEC8` (Teal) |
| Hover States | `#00CEC8/90` (Slightly darker teal) |

This color is consistent with the application's overall design language and provides a cohesive user experience.

---

## Database Schema

### Database Migration Applied

Successfully executed Supabase migration creating:

#### 1. Role Assignment Table

**public.user_roles** - Maps users to roles (admin, hr, applicant)
- Links to `auth.users(id)` for secure authentication integration
- Uses ENUM type `app_role` for role values

#### 2. Profiles Table

**public.profiles** - Stores user information
- user_id (links to auth.users)
- full_name
- phone
- Auto-created via database trigger on new user signup

#### 3. Applicants Table

**public.applicants** - Main application tracking table
- Links to profiles via user_id
- Stores PDF URLs (pre_employment_url, policy_rules_url)
- Status tracking: pending, revision_required, approved, rejected
- Approval/rejection tracking with timestamps and admin IDs

#### 4. Storage Bucket

**applicant-docs** - Stores uploaded PDF files
- Files named with applicant name: JOHN_DOE-pre-employment.pdf

#### 5. Row Level Security (RLS) Policies

**User Policy:**
Users can only see their own uploads:
```sql
CREATE POLICY "Users can view their own uploads"
ON public.document_uploads FOR SELECT
USING (auth.uid() = user_id);
```

**Admin Policy:**
Admins can view and edit all uploads:
```sql
CREATE POLICY "Admins can view all uploads"
ON public.document_uploads FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

**Security Functions:**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;
```

#### 4. Role Seeding

Created seed data for testing:
- Admin account: `admin@hrhub.com` with admin role
- Employee account: `employee@hrhub.com` with employee role
- On CONFLICT DO NOTHING for idempotency

---

## User Roles and Permissions

### Role Hierarchy

1. **Administrator** - Full access to all features
   - User management
   - Submission review
   - System configuration

2. **Employee** - Access to employee-specific features
   - View assigned tasks
   - Update personal information

3. **Applicant** - Can submit documents
   - Upload salary and policy PDFs
   - View submission status

### Access Control Implementation

- Role-based rendering in Dashboard.tsx
- Database-level RLS policies
- Server-side role verification

---

## Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool |
| React Router DOM | 6.30.1 | Routing |
| Lucide React | 0.462.0 | Icons |
| Shadcn/UI | - | Component library |
| Tailwind CSS | 3.4.17 | Styling |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Authentication and database |
| Supabase Auth | User management with MFA |
| PostgreSQL | Relational database |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9.32.0 | Code linting |
| TypeScript ESLint | TypeScript linting |
| Git | Version control |

---

## Features Implemented

### Completed Features

✅ **Authentication Enhancements:**
- Separate state management for Sign In and Sign Up forms
- Password visibility toggle with eye icons (fixed Feb 13)
- Automatic field clearing on tab switch
- Password strength validation with visual indicator (red/orange/yellow/green)
- MFA support (Email-only, SMS/Voice removed in v1.4)
- Forgot Password page with email reset
- Reset Password page with comprehensive validation
- Password visibility toggle on Reset Password page
- Automatic redirect to login after password reset
- Dashboard redirect prevention when resetting password
- Simplified signup flow using Supabase email confirmation

✅ **UI/UX Improvements:**
- Modern password input design with embedded eye toggle
- Dark mode support for all auth components
- Responsive mobile toggle buttons
- Toast notifications for user feedback
- Real-time password strength checklist
- Increased font sizes on Auth page for better readability
- Password toggle icons fixed (EyeOff shown when hidden, Eye when visible)
- Improved password strength meter colors for dark mode

✅ **Email Templates:**
- Confirm Sign-Up email template with teal (#00CEC8) branding
- Reset Password email template with teal branding
- Logo removed from email templates for better compatibility
- Custom HTML email templates for brand consistency

✅ **Database Setup:**
- Role assignment tables with ENUM type
- Document uploads table for PDF documents
- Row Level Security policies
- Role-based access control with security definer functions

✅ **Approval & Rejection Workflow:**
- Reject button in Admin Dashboard
- Archived tab showing approved and rejected applicants
- Approval/rejection tracking with timestamps and admin user IDs
- Delete button to remove PDF files and user accounts
- Auto-delete Edge Function for 45-day record cleanup

✅ **Email Notifications:**
- SMTP configuration with Google App Password
- Edge Function for sending approval emails
- Company branding changed to "Sagility"

### User Roles

| Role | Capabilities |
|------|-------------|
| Admin | Full system access, user management, submission review, invite users, delete records |
| HR Employee | View Pending/Archived tabs (read-only), cannot approve/reject/delete |
| Applicant | Document submission, status viewing, edit profile name |

**Note:** The "Employee" role was removed. Approved applicants stay as "applicant" and can view their submitted documents.

---

## Files Modified

### Source Files

| File | Changes |
|------|---------|
| src/pages/Auth.tsx | Complete auth component rewrite with separate state, password validation, field clearing |
| src/pages/Auth.tsx | Added "Forgot your password?" link to login form |
| src/pages/Auth.tsx | Removed phone input, fixed password toggle icons (v1.4) |
| src/hooks/useAuth.tsx | Authentication hooks with role fetching |
| src/hooks/useAuth.tsx | Email redirect configuration for confirmation (v1.4) |
| src/index.css | Password toggle styling, password strength indicator, increased font sizes for Auth page |
| src/lib/mfa.ts | MFA helper functions for OTP generation and sending |
| src/components/auth/ForgotPassword.tsx | NEW - Password reset request page |
| src/components/auth/ResetPassword.tsx | NEW - Password reset completion page with validation |
| src/components/auth/MFASetup.tsx | Simplified to email-only MFA (v1.4) |
| src/components/auth/MFAPrompt.tsx | Simplified to email-only verification (v1.4) |
| public/logo.png | Logo moved to public folder for email templates |
| src/components/ApplicantDashboard.tsx | PDF renaming with applicant name (v1.7) |
| src/components/AdminDashboard.tsx | Added Reject button, Archived tab, approval tracking, Delete button (v1.7) |

### Configuration Files

| File | Changes |
|------|---------|
| .env | Supabase project configuration (updated with new credentials) |
| src/App.tsx | Added routes for /forgot-password and /reset-password |
| src/App.tsx | Added route for /confirm (v1.4) |

### Documentation Files

| File | Changes |
|------|---------|
| OPERATIONS.md | Session tracker and conversation history (v1.4) |
| DOCUMENTATION.md | Version 1.7 updates (Feb 26, 2026) |

### Database Files

| File | Purpose |
|------|---------|
| supabase/migrations/20251223153400_b2e899b8-95d4-485d-a869-8864b2b591c6.sql | Migration script |

### Edge Functions

| Function | Purpose |
|----------|---------|
| supabase/functions/send-approval-email/index.ts | Sends approval email notifications |
| supabase/functions/delete-old-records/index.ts | Auto-deletes records older than 45 days |

---

## Known Issues

### Issue 1: Localhost Connection

**Problem:** Firefox browser unable to connect to server

**Resolution:** Application runs on port 8081, not 3000

**Access URL:** http://localhost:8081/

### Issue 2: Password Toggle Visual

**Problem:** Eye icons appeared misplaced without styling

**Resolution:** Added complete CSS for password input container and toggle button positioning

### Issue 3: User Role Assignment

**Problem:** Users logging in saw "No role assigned" message

**Resolution:** Applied database migration to seed roles for admin and employee accounts

---

## Setup Instructions

### Prerequisites

1. Node.js 18+
2. npm or bun package manager
3. Supabase account
4. Git

### Installation

```bash
# Clone the repository
git clone https://github.com/immortalperson22/SagilityHR.git

# Navigate to project directory
cd SagilityHR

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

```bash
# Apply Supabase migrations
npx supabase db push

# Or run migrations manually in Supabase SQL Editor
```

---

## Testing Checklist

### Authentication Testing

- [x] Server starts successfully on localhost:8080
- [x] Admin account logs in with full access
- [x] Employee account logs in with limited access
- [x] Password visibility toggle works on both forms (fixed Feb 13)
- [x] Fields clear when switching between Sign In and Sign Up
- [x] MFA prompt modal functions correctly (email-only)
- [x] Dark mode toggle works
- [x] Mobile responsive design functions
- [x] Password strength indicator works correctly
- [x] Special character (@) accepted in passwords
- [ ] Signup flow: Check email confirmation link works
- [ ] Signup flow: Confirmation popup displays after email verification

### Password Reset Testing

- [ ] Navigate to /forgot-password
- [ ] Enter valid email address
- [ ] Receive password reset email
- [ ] Click reset link in email
- [ ] Reset Password page loads correctly
- [ ] Password with @ symbol accepted
- [ ] Confirm password validation works
- [ ] Password visibility toggle works
- [ ] Strong password submitted successfully
- [ ] Redirect to login page after success
- [ ] Can login with new password

---

## Next Steps

### Immediate Priorities

1. **Test Password Reset Flow**
   - Verify forgot password email delivery
   - Test reset link functionality
   - Confirm redirect to login after reset
   - Validate new password login

2. **Test Authentication Flow**
   - Sign up new applicant
   - Verify role assignment
   - Test MFA setup

### Short-term Goals

1. **Build Applicant PDF Upload Component**
   - Salary PDF upload
   - Policy PDF upload
   - Submission status tracking

2. **Create Admin Review Dashboard**
   - View all submissions
   - Approve/reject workflow
   - Admin comment system

3. **Implement Submission Status Workflow**
   - Pending → Approved/Rejected
   - Status updates
   - Email notifications

### Long-term Vision

1. Email notification system
2. Advanced admin reporting
3. User profile management
4. Audit logging
5. Performance optimization

---

## Git Commit History

Recent commits documenting progress:

```
feat: enhance Auth component with separate state, password toggle, and field clearing
feat: update seed.sql with correct admin User ID
feat: recreate seed.sql with admin role
feat: move seed.sql back to supabase/seed.sql
feat: add password strength requirements
feat: remove completion popup message
feat: implement conditional MFA for sign-in
feat: enhance auth system with validations
feat: Add forgot password and reset password pages
fix: Update Supabase credentials to new project
fix: ResetPassword validation and redirect
fix: Redirect to localhost:8080/auth after password reset
fix: Add password visibility toggle to ResetPassword
docs: Update DOCUMENTATION.md with password reset feature
docs: Add brand color #00CEC8 to Password Reset Feature section
fix: Prevent dashboard redirect when going back to forgot password page
fix: Add CSS color to password strength meter
fix: Improve password strength meter styling for dark mode
fix: Increase font sizes on Auth page for better readability
```

---

## Conclusion

Today's session successfully implemented critical authentication enhancements including complete state separation, password visibility toggles, and automatic field clearing. The database schema was established with proper role-based access control and security policies.

While localhost connection issues remain to be fully resolved, the foundational components are in place for continued development of the Sagility platform.

---

## For Documentarist

### Key Points to Emphasize

1. **Security-First Approach**
   - Row Level Security (RLS) policies
   - Multi-factor authentication (MFA)
   - Password strength requirements
   - Role-based access control
   - Secure password reset with email verification

2. **User-Centric Design**
   - Password visibility toggle
   - Automatic field clearing
   - Dark mode support
   - Responsive design
   - Forgot password flow
   - Real-time password strength indicators

3. **Modern Technology Stack**
   - React 18 with TypeScript
   - Supabase for backend
   - Tailwind CSS for styling
   - Vite for build tooling

### Screenshots Needed

1. Sign In page with password toggle
2. Sign Up page with all fields
3. Tab switching animation
4. Dark mode toggle
5. Admin dashboard view
6. Mobile responsive layout
7. MFA setup modal
8. Submission status workflow
9. Forgot Password page
10. Reset Password page with validation
11. Password strength checklist

### Technical Diagrams Recommended

1. Database schema showing user_roles and submissions relationships
2. Authentication flow diagram
3. Password reset flow diagram
4. Role-based access control hierarchy
5. Component architecture overview

---

*Document generated for capstone project documentation purposes.*
*Sagility - Employee Management Platform*
*Version 1.3 - February 8, 2026*

**Version 1.3 Highlights:**
- Enhanced UI with password strength meter colors and larger fonts
- Custom email templates with teal (#00CEC8) branding
- Improved password reset flow with redirect prevention
