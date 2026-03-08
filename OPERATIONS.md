# VM Crash Recovery & Operations Guide

**Purpose:** Practical operations manual. Tracks crashes, recovery steps, and conversation history separate from technical DOCUMENTATION.md.

---

## Quick Recovery Commands

### Check System Status
```bash
swapon --show
free -h
```

### Close Heavy Apps
```bash
pkill -f firefox
pkill -f "code"
```

### Run App in Production Mode
```bash
cd /home/JerutaX/Downloads/SagilityHR-main
npm run build && npm run preview
```

---

## Crash Log Template

**Copy this each time VM crashes:**

```
=== CRASH LOG ===
Date: [TODAY'S DATE]
Time: [TIME]
Trigger: [What were you doing?]
Symptoms: [Freeze / Lag / Error message]
Apps Open: [Firefox? VS Code? Terminal?]
Memory at crash: [Check with 'free -h' after restart]
Resolution: [How did you fix it?]
Notes: [Any additional info]
=================
```

---

## Conversation & Crash Tracker

| Date | Topic | Outcome | Notes |
|------|-------|---------|-------|
| 2026-02-10 | VM Crash Investigation | Identified no swap space | Added 4GB swap manually |
| 2026-02-10 | Project Status Check | Found no confirmation page | Need to build one |
| 2026-02-10 | Complete Freeze | Firefox+VS Code+Terminal = crash | Prevention: Close VS Code when running app |
| 2026-02-13 | Remove Phone Verification | Removed SMS/Voice options | Only email verification remains |
| 2026-02-13 | Password Toggle Fix | Swapped Eye/EyeOff icons | Icons now show correctly |
| 2026-02-13 | Signup Flow Change | Removed MFA modal from signup | Uses Supabase email confirmation |
| 2026-02-13 | Email Confirm Page | Created /confirm page (then undone) | Rate limit hit, pending retest |
| 2026-02-13 | Password Toggle Fix (v1.3) | Fixed again after revert | Eye/EyeOff now correct |
| 2026-02-15 | Applicant Dashboard | Created PDF upload components | Pre-Employment + Policy |
| 2026-02-15 | Admin Dashboard | Created review workflow | Approve/Reject |
| 2026-02-15 | Verify Page | Created confirmation redirect | /verify route |
| 2026-02-15 | Role Assignment Fix | Created RPC function | assign_default_role for applicant |
| 2026-02-15 | SMTP Setup | Configured Gmail SMTP | sagility22@gmail.com |
| 2026-02-16 | Email Template Fix | Recreated custom template | Works now |
| 2026-02-16 | Verify Page Update | Added pending state + resend | Now handles all states |
| 2026-02-19 | Submission Debugging | Fixed Storage + RLS + Table Cols | Verified PDF uploads work |
| 2026-02-19 | Dashboard Unification | Unified routes at /dashboard | Removed legacy split system |
| 2026-02-19 | Admin Visibility Fix | Fixed RLS + Schema relationship | Admin can now see applicants |
| 2026-02-19 | Automated Profiles | Added DB Trigger for profile sync | Fixes missing applicant names |
| 2026-02-26 | Email Notifications | SMTP + Edge Function | Sends to delosreyesjp28@gmail.com |
| 2026-02-26 | PDF Naming | Added applicant name to filename | JOHN_DOE-pre-employment.pdf |
| 2026-02-26 | Reject Button | Added to Admin Dashboard | With rejection tracking |
| 2026-02-26 | Archived Tab | Shows approved + rejected | New tab in Admin Dashboard |
| 2026-02-26 | Delete Button | Deletes PDFs + User account | Manual admin control |
| 2026-02-26 | Auto-Delete Function | 45-day cleanup Edge Function | delete-old-records |
| 2026-02-26 | Team Management | Added Team tab + Invite functionality | Admins can create HR/Admin users |
| 2026-02-26 | HR Employee Role | Added hr role with view-only access | Cannot approve/reject/delete |
| 2026-02-26 | Logout Fix | Fixed logout not redirecting | Added window.location.reload |
| 2026-02-26 | Dashboard Title Fix | Shows HR Employee Dashboard for hr role | Admin Dashboard for admin |
| 2026-02-26 | Remove Employee Role | Removed employee from Dashboard | Keep only applicant/hr/admin |
| 2026-02-26 | Delete Unused Tables | Removed document_uploads + submissions | Clean database |
| 2026-02-26 | Profile Trigger | Added handle_new_user trigger | Auto-create profiles on signup |
| 2026-02-26 | Edit Name Feature | Added Edit Name button for applicants | Can update full_name |

---

## Conversation Details

### Topic: SMTP Configuration
**Date:** 2026-02-15 to 2026-02-16
**Actions:**
- Set up Gmail SMTP with sagility22@gmail.com
- Generated App Password for Supabase
- Fixed custom email template (recreated it)
- Template now shows Sagility branding
**Result:** ✅ Custom emails working

### Topic: Verify Page Enhancement
**Date:** 2026-02-16
**Actions:**
- Modified Verify.tsx to handle pending/loading/confirmed/error states
- Added Resend Confirmation Email button
- Added Go to Sign In button
- Updated Auth.tsx to redirect to /verify?email= after signup
**Result:** ✅ Works now

### Topic: Applicant Workflow
**Date:** 2026-02-15
**Actions:**
- Created ApplicantDashboard.tsx with PDF upload
- Created AdminDashboard.tsx for review
- Created PdfFixEditor.tsx for re-uploads
- Created applicants table migration
**Result:** ✅ Components created

### Topic: Role Assignment Fix
**Date:** 2026-02-15
**Actions:**
- Created assign_default_role() function in Supabase
- Updated signUp to use RPC function
- Fixed RLS policies for user_roles
**Result:** ✅ New users get applicant role automatically

---

## Conversation Details (2026-02-26)

### Topic 1: Email Notification System
**Issue:** Need to send approval notifications to HR email.
**Actions:**
- Configured SMTP with Google App Password (ubsulnwisyhlgjyc)
- Created Edge Function `send-approval-email`
- Updated email template with "Sagility" branding (changed from "HR Hub Pro")
- Set recipient to: delosreyesjp28@gmail.com
**Result:** ✅ Approval emails sent successfully

### Topic 2: PDF File Naming Convention
**Issue:** PDF files needed to include applicant name for easier identification.
**Actions:**
- Updated `ApplicantDashboard.tsx` to generate filename with applicant name
- Format: "JOHN_DOE-pre-employment.pdf" and "JOHN_DOE-policy.pdf"
- Uses applicant's full name from profile, converted to uppercase with underscores
**Result:** ✅ PDFs now include applicant name

### Topic 3: Reject Button & Archived Tab
**Issue:** Admin needed ability to reject applicants and view archived records.
**Actions:**
- Added Reject button to AdminDashboard.tsx
- Created Archived tab showing approved AND rejected applicants
- Added rejection tracking columns to database
**Result:** ✅ Two-tab system: Pending | Archived

### Topic 4: Approval/Rejection Tracking
**Issue:** Need to track who approved/rejected and when.
**Actions:**
- Added columns to applicants table: approved_at, approved_by, rejected_at, rejected_by
- Updated SaveDecision function to record timestamp and admin user ID
**Result:** ✅ Full audit trail in database

### Topic 5: Delete Functionality
**Issue:** Need manual delete for PDF files + user accounts.
**Actions:**
- Added Delete button in AdminDashboard
- Deletes PDF files from Supabase Storage
- Removes user from Supabase Auth
- Cleans up profiles and user_roles table entries
**Result:** ✅ Complete cleanup on delete

### Topic 6: Auto-Delete Edge Function
**Issue:** Need automatic cleanup of records after 45 days.
**Actions:**
- Created Edge Function `delete-old-records`
- Checks for approved/rejected records older than 45 days
- Deletes PDFs from storage and removes user accounts
- Can be triggered via cron job or manual invocation
**Result:** ✅ Auto-delete function ready (needs cron setup)

### Topic 7: Team Management Feature (HR Employee Role)
**Issue:** Need to create HR employees who can only view applicants (no approval powers).
**Actions:**
- Created Team tab in AdminDashboard (Admins only)
- Added invite functionality to create new Admin or HR Employee accounts
- HR Employees can view Pending and Archived tabs but cannot Approve/Reject/Delete
- Added protection against deleting last admin and self-deletion
**Result:** ✅ Complete team management with role-based permissions

### Topic 8: Logout & Dashboard Title Fix
**Issue:** Logout not redirecting to /auth page. Title showed "Admin Dashboard" for HR employees.
**Actions:**
- Updated signOut function to use window.location.reload for complete logout
- Fixed Dashboard title to show "HR Employee Dashboard" for hr role, "Admin Dashboard" for admin
- Updated Layout to show "HR" badge instead of "employee"
**Result:** ✅ Logout works, titles now correct

### Topic 9: Remove Employee Role & Cleanup
**Issue:** Employee role was unused. Legacy tables still in database.
**Actions:**
- Removed employee role from Dashboard (kept only applicant/hr/admin)
- Approved applicants now stay as applicant (can view their submitted docs)
- Updated types.ts to remove "employee" from enum
- Deleted unused tables: document_uploads, submissions
**Result:** ✅ Clean database, only 3 active roles

### Topic 10: Profile Management
**Issue:** Applicants couldn't update their name. New users needed auto-profile creation.
**Actions:**
- Added "Edit Name" button in ApplicantDashboard
- Created database trigger handle_new_user() for auto-profile creation
- Created assign_default_role() function for role assignment
**Result:** ✅ Users can edit name, profiles auto-created on signup

### Topic 1: Smart Resubmit Logic
**Issue:** Applicants had to restart from blank templates when a revision was requested.
**Actions:**
- Updated `ApplicantDashboard.tsx` with dynamic Sejda URL generation.
- Configured links to point to previously uploaded files during `revision_required` state.
**Result:** ✅ Applicants can now edit existing PDF submissions directly.

### Topic 2: Storage Optimization (Overwrite Mode)
**Issue:** Multiple versions of the same PDF were filling up Supabase storage.
**Actions:**
- Removed timestamps from file paths in `uploadFile`.
- Enabled `upsert: true` to ensure new uploads replace old versions.
**Result:** ✅ One active copy per document, staying within Supabase Free Tier limits.

### Topic 3: Applicant Document Viewer
**Issue:** Applicants couldn't verify their own uploads without downloading them manually.
**Actions:**
- Added "Open Document" (Eye icon) buttons to the Applicant Dashboard.
- Mirrored the layout and logic from the Admin Dashboard for consistency.
**Result:** ✅ Applicants have full visibility of their submitted documents.

### Topic 4: Admin Workflow Refinement
**Issue:** Redundant "Reject" button causing confusion in the simple onboarding process.
**Actions:**
- Removed the "Reject" button from the Admin Dashboard.
- Standardized on "Approve" (role promotion) and "Revision" (correction) paths.
**Result:** ✅ Streamlined admin interface focused on active outcomes.

### Topic 5: Final Onboarding Polish & Real-Time Sync (2026-02-24)
**Issue:** Transition from applicant to employee required a page refresh, and admin feedback loop was clunky.
**Actions:**
- Implemented real-time `user_roles` listener in `useAuth.tsx`.
- Added celebratory "Party Popper" toast in `Dashboard.tsx` upon promotion.
- Enhanced `AdminDashboard.tsx` to clear selection after approval for better workflow.
- Updated `DevMode.tsx` with a state switcher for previewing all onboarding states.
**Result:** ✅ Fully reactive and polished onboarding loop complete.

---

## Conversation Details (2026-02-19)

### Topic 1: Split System & Dashboard Unification
**Issue:** Users were split between legacy and premium designs across multiple routes (`/dashboard`, `/admin`, `/applicant`).
**Actions:**
- Unified all roles at the `/dashboard` route.
- Replaced legacy common components with the premium Teal/Dark designs.
- Removed redundant routes and standalone page files (`src/pages/AdminDashboard.tsx`, etc.).
- Synchronized components to work within the standard `Layout` structure.
**Result:** ✅ Single, unified premium experience for all roles.

### Topic 2: Submission Infrastructure Failure
**Issue:** PDF uploads were failing due to missing storage policies and database column mismatches.
**Actions:**
- Created RLS policies for the `applicant-docs` bucket.
- Added missing `feedback` columns to the `applicants` table.
- Fixed RLS policies on the `applicants` table to allow secure submissions.
**Result:** ✅ Verified that PDF uploads function correctly.

### Topic 3: Admin Data Visibility & Name Sync
**Issue:** Admin dashboard showed zero applicants and names were listed as "Unknown".
**Actions:**
- Resolved RLS recursion in `user_roles` policy.
- Established the missing foreign key link between `applicants` and `profiles`.
- Created a database trigger `handle_new_user` to automatically sync names from auth metadata to profiles.
- Manually fixed the name for the existing test applicant.
**Result:** ✅ Admin can see all applicants with their real names.

---

## Conversation Details (2026-02-13)

### Topic 1: Remove Phone Verification
**Request:** Remove phone verification option, keep only email
**Actions:**
- MFASetup.tsx: Removed SMS radio option, simplified to email-only
- MFAPrompt.tsx: Removed SMS/Voice buttons, kept only Email
- Auth.tsx: Removed phone input field from signup form
**Result:** ✅ Build successful

### Topic 2: Password Toggle Fix
**Issue:** Toggle icons were opposite
**Actions:**
- Auth.tsx: Swapped Eye/EyeOff icons for both Sign In and Sign Up
**Result:** ✅ Build successful

### Topic 3: Signup Flow - Email Confirmation
**Request:** After signup, show confirmation popup when user clicks email link
**Plan:**
1. Signup → Show "Check your email" message
2. User clicks confirmation link in email
3. Redirect to /confirm page with popup
4. User clicks OK → Go to Sign In

**Implementation (Created then Undone):**
- useAuth.tsx: Changed redirect URL to `/confirm`
- Created EmailConfirm.tsx page with popup
- App.tsx: Added `/confirm` route
- Build: ✅ Successful

**Issue:** Hit Supabase email rate limit when testing
**Result:** Undone all changes, pending retest when rate limit clears

### Topic 4: Supabase Rate Limit Issue
**Problem:** "Email rate limit exceeded" when testing signup
**Cause:** Supabase free tier limits ~3-5 emails per hour
**Solution:** Wait 1-4 hours OR delete existing user in Supabase Dashboard first

---

### IMPORTANT: Recording Guidelines
**ALWAYS record conversation details in OPERATIONS.md after each session!**
- Include date, topic, actions taken, and outcomes
- Note any issues or pending items
- This helps track decisions and allows retesting without losing context
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## Build Mode Commands

### Always Run First
```bash
cd /home/JerutaX/Downloads/SagilityHR-main
```

### Production Build (Use This!)
```bash
npm run build
npm run preview
```
- Access: http://localhost:8080
- Uses less memory than dev server
- More stable on VM

### Dev Server (Only If Needed)
```bash
npm run dev
```
- Use ONLY when you need hot reload
- Close VS Code first!

---

## Prevention Checklist

Before running app:
- [ ] `swapon --show` → Confirm swap active
- [ ] Close Firefox
- [ ] Close VS Code
- [ ] Only terminal open

While testing:
- [ ] Open Firefox ONLY to test
- [ ] Close Firefox immediately after
- [ ] Don't browse other sites with Firefox

---

## Memory Monitoring

```bash
watch -n 1 free -h
```
Run in separate terminal to watch memory in real-time.

Warning signs:
- `available` drops below 1GB
- `swap` used > 1GB
- System feels slow

Action:
```bash
pkill -f firefox
```

---

## Project-Specific Commands

### Check Current State
```bash
ls -la /home/JerutaX/Downloads/SagilityHR-main/src/pages/
```

### Auth Pages Location
```
/home/JerutaX/Downloads/SagilityHR-main/src/pages/Auth.tsx
/home/JerutaX/Downloads/SagilityHR-main/src/components/auth/
```

### Build Status
```bash
ls -la /home/JerutaX/Downloads/SagilityHR-main/dist/
```

---

## Current Project Status

**Last Updated:** 2026-02-26

### What's Working:
- Authentication (Sign In/Sign Up)
- Password reset flow
- Role-based access (Admin/HR Employee/Applicant) - NO employee role
- Database schema with RLS policies
- Password visibility toggle
- Signup with email confirmation (Supabase)
- Smart Resubmit for PDFs
- Storage Overwrite/Upsert
- Applicant Document Viewer
- Email Notifications with "Sagility" branding
- PDF naming with applicant name
- Reject button + Archived tab
- Approval/Rejection tracking
- Delete button for manual cleanup
- Auto-delete function for 45-day cleanup
- Team Management - invite Admins and HR Employees
- Role-based permissions - HR view-only
- Edit Name button for applicants
- Auto-profile creation on signup
- Profile trigger handle_new_user()

### Roles (Active):
| Role | Access |
|------|--------|
| Applicant | Submit PDFs, view own status, edit name |
| HR Employee | View Pending/Archived (read-only) |
| Admin | Full control + invite users |

### Database Tables (Active):
| Table | Purpose |
|-------|---------|
| profiles | User information |
| user_roles | Access control |
| applicants | Job applications & PDFs |
| applicant-docs (bucket) | PDF file storage |

### Known Issues:
- Supabase Egress limit exceeded (126%) - Waiting for reset on March 20, 2026
- Solution: Upgrade to Pro OR wait for billing cycle reset

---

## Documentation Notes

**This file differs from DOCUMENTATION.md:**
- `DOCUMENTATION.md` = Technical specs, features, architecture, version history
- `OPERATIONS.md` = Operations, crash recovery, practical commands, conversation tracker

---

## Next Actions

| Priority | Action | Status | Date |
|----------|--------|--------|------|
| High | Test complete workflow (Applicant, HR, Admin) | Pending | After egress resets |
| High | Deploy to GitHub Pages | Pending | - |
| Medium | Set up cron job for auto-delete | Optional | - |
| Medium | Upgrade to Pro if needed for production | Optional | - |
| Low | Optimize VM settings | Optional | - |

---

## Supabase Free Tier Limits

| Resource | Limit | Current Usage | Status |
|----------|-------|---------------|--------|
| Egress | 5 GB/month | 6.31 GB | ⚠️ Exceeded (resets March 20) |
| Database | 0.5 GB | 26.71 MB | ✅ OK |
| Storage | 1 GB | <1 MB | ✅ OK |
| MAU | 50,000 | 3 | ✅ OK |

### Egress Calculation (Normal Use)
- 30 applicants + 3 staff = ~1.4 GB/month
- Well within 5 GB limit for normal use
- Testing caused the excess (nonstop page loads/views)

---

---

## VM Specifications (For Reference)

| Component | Value | Notes |
|-----------|-------|-------|
| RAM | 7.8GB | Allocated by VirtualBox |
| CPU | 4 cores | - |
| Disk | 30GB | 7.8GB free |
| Swap | 4GB | Added 2026-02-10 |
| OS | Ubuntu | - |

---

## Key Learnings

1. **Always add swap space** to prevent crashes
2. **Never run dev server + Firefox + VS Code together**
3. **Production build is more stable** on constrained VMs
4. **Close apps immediately after testing**
5. **Monitor memory** with `watch -n 1 free -h`

---

## Emergency Recovery Steps

### Complete Freeze:
1. Force restart VirtualBox VM
2. Wait for Ubuntu to load
3. Run `swapon --show`
4. If no swap → Re-run swap setup commands
5. Close Firefox, VS Code
6. Run production build only

### Still Crashing:
1. Check `free -h` for available memory
2. If `available` < 2GB → Close more apps
3. Reboot VM completely (not just restart)
4. Try production build instead of dev server

---

**Last Updated:** 2026-02-26
**Maintained By:** JerutaX
