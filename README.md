# Sagility - Employee Management Platform

**A comprehensive employee management system built as a capstone project**

---

## Live Demo

🌐 **Live URL**: https://v0-sagility.vercel.app

## 📋 Project Overview

Sagility is an employee management platform designed to streamline HR operations. This project demonstrates full-stack development skills including secure authentication, role-based access control, document management, and responsive UI design.

### Key Features

- 🔐 **Secure Authentication** - Multi-factor authentication (MFA) with Email OTP, password strength enforcement
- 👥 **Role-Based Access** - Admin, Employee, and Applicant roles with different permissions
- 📄 **Document Management** - PDF upload and submission workflow
- 🌙 **Dark Mode Support** - Full dark mode toggle
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Security First** - Row Level Security (RLS), input validation, secure coding practices

---

## 🎯 Capstone Project Purpose

This project was developed as a capstone submission demonstrating:

- **Full-Stack Development** - React frontend with Supabase backend integration
- **Security Implementation** - Industry-standard security practices
- **Database Design** - Relational database with proper constraints and policies
- **UI/UX Design** - Modern, responsive interface with user-friendly interactions
- **Problem Solving** - Custom solutions for authentication, state management, and access control

---

## 🛠️ Technologies Used

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18.3.1 | UI library |
| TypeScript 5.8.3 | Type safety and code quality |
| Vite 5.4.19 | Build tool and development server |
| Tailwind CSS 3.4.17 | Styling and responsive design |
| Shadcn/UI | Component library |
| Lucide React 0.462.0 | Icons |
| React Router DOM 6.30.1 | Client-side routing |

### Backend

| Technology | Purpose |
|------------|---------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Relational database |
| Supabase Auth | User authentication with MFA |
| Row Level Security | Database-level access control |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint 9.32.0 | Code linting |
| TypeScript ESLint | TypeScript quality assurance |
| Git | Version control |
| npm | Package management |

---

## ✨ Features Implemented

### Authentication System

The authentication system was built from scratch with manual implementation of:

- ✅ **Separate State Management** - No shared state between Sign In and Sign Up forms
- ✅ **Password Visibility Toggle** - Eye icons for showing/hiding passwords
- ✅ **Automatic Field Clearing** - Fields reset when switching between forms
- ✅ **Password Strength Validation** - Enforces strong passwords (8+ chars, uppercase, lowercase, numbers, special characters)
- ✅ **Multi-Factor Authentication** - Email OTP-based MFA for enhanced security
- ✅ **Role-Based Redirect** - Different dashboards based on user role

**Code Example - Password Toggle Implementation:**
```typescript
const [showPassword, setShowPassword] = useState(false);

return (
  <div className="password-input-container">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      className="password-toggle"
    />
    <button onClick={() => setShowPassword(!showPassword)}>
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);
```

### User Roles and Permissions

Three distinct roles with different access levels:

| Role | Access Level |
|------|-------------|
| **Administrator** | Full system access, user management, submission review |
| **Employee** | Personal dashboard, assigned features |
| **Applicant** | Document submission, status tracking |

### Database Security

**Row Level Security (RLS) Policies:**
```sql
-- Applicants can only see their own applications
CREATE POLICY "applicant sees own applications"
ON public.applicants FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view and edit all applications
CREATE POLICY "admin sees all applications"
ON public.applicants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### Database Schema

```sql
-- User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'applicant')),
  UNIQUE(user_id, role)
);

-- Applicants Table
CREATE TABLE public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pre_employment_url TEXT,
  policy_rules_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or bun package manager
- Git for version control
- Supabase account

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

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

---

## 📁 Project Structure

```
SagilityHR/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/            # Shadcn/UI components
│   │   └── auth/          # Authentication components
│   ├── pages/              # Page components
│   │   ├── Auth.tsx       # Login/Signup page
│   │   └── Dashboard.tsx   # Main dashboard
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.tsx    # Authentication hook
│   ├── lib/                # Utility functions
│   ├── index.css          # Global styles
│   └── App.tsx            # Main application component
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml        # Supabase configuration
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔒 Security Features

This project implements industry-standard security practices:

### Authentication Security

- **Password Hashing** - Supabase handles secure password hashing
- **MFA Support** - TOTP-based two-factor authentication
- **Session Management** - Secure session handling
- **Password Policies** - Strength requirements enforced

### Database Security

- **Row Level Security** - Database-level access control
- **Prepared Statements** - SQL injection prevention
- **Foreign Key Constraints** - Data integrity
- **Check Constraints** - Valid data enforcement

### Frontend Security

- **Input Validation** - Client-side and server-side validation
- **XSS Prevention** - React's built-in escaping
- **CSRF Protection** - Supabase handles authentication securely
- **Environment Variables** - Sensitive data protection

---

## 📱 Responsive Design

The application is fully responsive and works on:

- 🖥️ Desktop (1024px and above)
- 📱 Tablet (768px - 1023px)
- 📱 Mobile (below 768px)

### Mobile Features

- Responsive navigation
- Touch-friendly interactions
- Optimized layouts for small screens
- Mobile-specific toggle buttons

---

## 🧪 Testing Performed

### Authentication Testing

- [x] User registration with all required fields
- [x] Password strength validation
- [x] Password visibility toggle
- [x] Form field clearing on tab switch
- [x] Email/password authentication
- [x] Role-based redirect

### Database Testing

- [x] User role assignment
- [x] RLS policy enforcement
- [x] Application creation and retrieval
- [x] Status workflow (pending → approved/rejected)

### UI/UX Testing

- [x] Dark mode toggle
- [x] Responsive layout
- [x] Form validation
- [x] Error message display
- [x] Loading states

---

## 📸 Screenshots

*Add screenshots of your working application here:*

- Sign In page
- Sign Up page
- Admin Dashboard
- Employee Dashboard
- Applicant Dashboard
- Dark mode toggle
- Mobile responsive views

---

## 🎓 Learning Outcomes

This capstone project demonstrates:

1. **Full-Stack Development** - End-to-end application development
2. **Database Design** - Relational database modeling
3. **Security Implementation** - Industry-standard practices
4. **UI/UX Design** - Modern, responsive interfaces
5. **Problem Solving** - Custom solutions for complex requirements
6. **Documentation** - Technical writing and project documentation

---

## 👤 Author

**JerutaX**

- GitHub: [@immortalperson22](https://github.com/immortalperson22)

---

## 📝 License

This project is licensed for educational purposes as a capstone project.

---

## 🙏 Acknowledgments

- **Supabase** - For providing excellent backend services
- **Shadcn/UI** - For the beautiful component library
- **Tailwind CSS** - For rapid styling capabilities
- **Lucide** - For consistent iconography

---

## 📞 Contact

For questions or collaboration opportunities, please reach out:

- GitHub: [@immortalperson22](https://github.com/immortalperson22)

---

*Built with ❤️ as a capstone project*
